import argparse
from pathlib import Path
from datetime import date, datetime
from openpyxl import Workbook, load_workbook
from openpyxl.styles import PatternFill, Font, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from openpyxl.chart import DoughnutChart, Reference, Series
from openpyxl.chart.label import DataLabelList

BASE_DIR = Path(r'C:\Users\1000528\files_claude')
TARGET_URL = 'https://practicesoftwaretesting.com'

# ── Colour palette ─────────────────────────────────────────────────────────────
C_HEADER_BG  = '1F3864'   # dark navy   – column header background
C_HEADER_FG  = 'FFFFFF'   # white       – column header text
C_TITLE_BG   = '2E75B6'   # blue        – report title background
C_TITLE_FG   = 'FFFFFF'   # white       – report title text
C_SUMMARY_BG = 'D6E4F0'   # light blue  – summary strip background
C_PASS_BG    = 'E2EFDA'   # light green – Passed row
C_FAIL_BG    = 'FCE4D6'   # light red   – Failed row
C_PASS_FG    = '375623'   # dark green  – Passed status cell text
C_FAIL_FG    = '9C0006'   # dark red    – Failed status cell text
C_ALT_ROW    = 'F5F5F5'   # light grey  – alternate row tint

def thin_border():
    s = Side(style='thin', color='BFBFBF')
    return Border(left=s, right=s, top=s, bottom=s)

def make_fill(hex_color):
    return PatternFill('solid', fgColor=hex_color)

def style_title_row(ws, row, run_id):
    """Merge + style the report title row."""
    ws.merge_cells(f'A{row}:E{row}')
    cell = ws.cell(row=row, column=1,
                   value=f'E2E Test Execution Report  ·  Run {run_id}  ·  {datetime.today().strftime("%Y-%m-%d")}')
    cell.font      = Font(bold=True, size=14, color=C_TITLE_FG, name='Calibri')
    cell.fill      = make_fill(C_TITLE_BG)
    cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=False)
    ws.row_dimensions[row].height = 28

def style_summary_row(ws, row, total, passed, failed):
    """Merge + populate the summary stats strip."""
    rate = f'{int(passed/total*100)}%' if total else '—'
    ws.merge_cells(f'A{row}:E{row}')
    cell = ws.cell(row=row, column=1,
                   value=f'Total: {total}     ✅ Passed: {passed}     ❌ Failed: {failed}     Pass Rate: {rate}')
    cell.font      = Font(bold=True, size=11, color='1F3864', name='Calibri')
    cell.fill      = make_fill(C_SUMMARY_BG)
    cell.alignment = Alignment(horizontal='center', vertical='center')
    ws.row_dimensions[row].height = 22

def style_header_row(ws, row, headers):
    for col, h in enumerate(headers, start=1):
        cell = ws.cell(row=row, column=col, value=h)
        cell.font      = Font(bold=True, size=11, color=C_HEADER_FG, name='Calibri')
        cell.fill      = make_fill(C_HEADER_BG)
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=False)
        cell.border    = thin_border()
    ws.row_dimensions[row].height = 20

def style_data_row(ws, row, values, is_alt):
    status = values[2]
    row_fill = make_fill(C_PASS_BG if status == 'Passed' else C_FAIL_BG) if status in ('Passed', 'Failed') \
               else (make_fill(C_ALT_ROW) if is_alt else None)
    for col, v in enumerate(values, start=1):
        cell = ws.cell(row=row, column=col, value=v)
        cell.font      = Font(size=10, name='Calibri')
        cell.alignment = Alignment(vertical='center', wrap_text=True)
        cell.border    = thin_border()
        if row_fill:
            cell.fill = row_fill
        # status column special colour
        if col == 3 and status in ('Passed', 'Failed'):
            cell.font = Font(bold=True, size=10, name='Calibri',
                             color=C_PASS_FG if status == 'Passed' else C_FAIL_FG)
    ws.row_dimensions[row].height = 45   # taller to fit multi-line notes

def set_column_widths(ws):
    widths = {'A': 20, 'B': 40, 'C': 10, 'D': 16, 'E': 60}
    for col, w in widths.items():
        ws.column_dimensions[col].width = w

HEADERS = ['Test Name', 'Target URL', 'Status', 'Execution Date', 'Notes']

def add_dashboard(wb, all_records):
    """Add a Dashboard sheet with a donut chart showing Passed vs Failed."""
    total  = len(all_records)
    passed = sum(1 for r in all_records if r['Status'] == 'Passed')
    failed = total - passed

    if 'Dashboard' in wb.sheetnames:
        del wb['Dashboard']
    ds = wb.create_sheet('Dashboard', 0)   # insert as first sheet
    ds.sheet_view.showGridLines = False

    # ── Title ─────────────────────────────────────────────────────────────────
    ds.merge_cells('A1:F1')
    t = ds.cell(1, 1, 'Test Execution Dashboard')
    t.font      = Font(bold=True, size=16, color=C_TITLE_FG, name='Calibri')
    t.fill      = make_fill(C_TITLE_BG)
    t.alignment = Alignment(horizontal='center', vertical='center')
    ds.row_dimensions[1].height = 32

    # ── KPI boxes (cols A-C, rows 3-5) ────────────────────────────────────────
    kpis = [
        ('Total Runs',  total,  'BDD7EE'),
        ('Passed',      passed, 'E2EFDA'),
        ('Failed',      failed, 'FCE4D6'),
    ]
    ds.row_dimensions[3].height = 14
    for col, (label, val, bg) in enumerate(kpis, start=1):
        # label row
        lc = ds.cell(4, col, label)
        lc.font      = Font(bold=True, size=10, color='1F3864', name='Calibri')
        lc.fill      = make_fill(bg)
        lc.alignment = Alignment(horizontal='center')
        lc.border    = thin_border()
        ds.row_dimensions[4].height = 18
        # value row
        vc = ds.cell(5, col, val)
        vc.font      = Font(bold=True, size=20, color='1F3864', name='Calibri')
        vc.fill      = make_fill(bg)
        vc.alignment = Alignment(horizontal='center', vertical='center')
        vc.border    = thin_border()
        ds.row_dimensions[5].height = 36
        ds.column_dimensions[get_column_letter(col)].width = 18

    # Pass rate
    rate_val = f'{int(passed/total*100)}%' if total else '0%'
    ds.merge_cells('D4:F4')
    r4 = ds.cell(4, 4, 'Pass Rate')
    r4.font = Font(bold=True, size=10, color='1F3864', name='Calibri')
    r4.fill = make_fill('FFF2CC')
    r4.alignment = Alignment(horizontal='center')
    r4.border = thin_border()
    ds.merge_cells('D5:F5')
    r5 = ds.cell(5, 4, rate_val)
    r5.font = Font(bold=True, size=20, color='375623' if failed == 0 else '9C0006', name='Calibri')
    r5.fill = make_fill('FFF2CC')
    r5.alignment = Alignment(horizontal='center', vertical='center')
    r5.border = thin_border()
    for c in ['D','E','F']:
        ds.column_dimensions[c].width = 10

    # ── Hidden data table for chart (cols H-I, rows 3-5) ─────────────────────
    ds.cell(3, 8, 'Status');  ds.cell(3, 9, 'Count')
    ds.cell(4, 8, 'Passed');  ds.cell(4, 9, passed)
    ds.cell(5, 8, 'Failed');  ds.cell(5, 9, failed)

    # ── Donut chart ───────────────────────────────────────────────────────────
    chart = DoughnutChart()
    chart.title       = 'Pass / Fail Distribution'
    chart.style       = 10
    chart.holeSize    = 50
    chart.width       = 14
    chart.height      = 12

    data   = Reference(ds, min_col=9, min_row=3, max_row=5)   # counts incl header
    labels = Reference(ds, min_col=8, min_row=4, max_row=5)   # labels
    chart.add_data(data, titles_from_data=True)
    chart.set_categories(labels)

    # Green slice for Passed, red for Failed
    from openpyxl.drawing.fill import PatternFillProperties
    from openpyxl.chart.data_source import NumDataSource, NumRef
    try:
        chart.series[0].dPt       # access series to set slice colours
        from openpyxl.chart.series import SeriesLabel
        from openpyxl.drawing.spreadsheet_drawing import SpreadsheetDrawing
    except Exception:
        pass

    ds.add_chart(chart, 'A7')


def rebuild_workbook(path, all_records):
    """Create (or recreate) a fully styled workbook from all_records list."""
    wb = Workbook()
    ws = wb.active
    ws.title = 'Execution Summary'
    ws.sheet_view.showGridLines = False

    run_id  = all_records[-1]['run_id'] if all_records else '???'
    total   = len(all_records)
    passed  = sum(1 for r in all_records if r['Status'] == 'Passed')
    failed  = total - passed

    # Row 1 – title
    style_title_row(ws, 1, run_id)
    # Row 2 – summary stats
    style_summary_row(ws, 2, total, passed, failed)
    # Row 3 – spacer
    ws.row_dimensions[3].height = 6
    # Row 4 – column headers
    style_header_row(ws, 4, HEADERS)

    # Data rows starting at row 5
    for i, rec in enumerate(all_records):
        values = [rec.get(h, '') for h in HEADERS]
        style_data_row(ws, 5 + i, values, is_alt=(i % 2 == 1))

    set_column_widths(ws)
    ws.freeze_panes = 'A5'          # freeze above data rows

    # Dashboard sheet with chart
    add_dashboard(wb, all_records)
    wb.active = wb['Execution Summary']   # open on summary sheet by default
    wb.save(path)

def load_existing_records(path):
    """Read existing data rows from a previously saved styled workbook."""
    wb = load_workbook(path)
    ws = wb.active
    records = []
    # data starts at row 5 (row 4 = headers)
    for row in ws.iter_rows(min_row=5, values_only=True):
        if any(v for v in row):
            records.append({HEADERS[i]: (row[i] or '') for i in range(len(HEADERS))})
    return records

# ── CLI ────────────────────────────────────────────────────────────────────────
def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--id',       required=True,  help='3-digit run ID')
    parser.add_argument('--status',   required=True,  choices=['Passed', 'Failed'])
    parser.add_argument('--scenario', required=False, default='')
    parser.add_argument('--branch',   required=False, default='feat/ai-automation')
    parser.add_argument('--notes',    required=False, default='')
    return parser.parse_args()

def build_record(args):
    spec_file = f'e2e-demo-{args.id}.spec.ts'
    # Professional multi-line Notes (\n renders with wrap_text in Excel)
    lines = [
        f'Run ID      : {args.id}',
        f'Spec File   : {spec_file}',
        f'Browser     : Chromium (Headed)',
        f'Branch      : {args.branch}',
    ]
    if args.scenario:
        lines.append(f'Scenario    : {args.scenario}')
    if args.notes:
        lines.append(f'Remarks     : {args.notes}')
    notes = '\n'.join(lines)
    return {
        'run_id':         args.id,
        'Test Name':      f'e2e-demo-{args.id}',
        'Target URL':     TARGET_URL,
        'Status':         args.status,
        'Execution Date': date.today().isoformat(),
        'Notes':          notes,
    }

args   = parse_args()
record = build_record(args)
path   = BASE_DIR / f'E2E_Test_Execution_Summary-{args.id}.xlsx'

# ── Main logic ─────────────────────────────────────────────────────────────────
if path.exists():
    existing = load_existing_records(path)
else:
    existing = []

existing.append(record)
rebuild_workbook(path, existing)

action = 'Updated' if len(existing) > 1 else 'Created'
print(f'{action} styled report → {path}  ({len(existing)} row(s))')
