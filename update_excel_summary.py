import zipfile
from pathlib import Path
from datetime import date

path = Path(r'C:\Users\1000528\files_claude\E2E_Test_Execution_Summary.xlsx')

# Execution details (adjust as needed)
record = {
    'Test Name': 'E2E demo - Combination Pliers',
    'Target URL': 'https://practicesoftwaretesting.com',
    'Status': 'Failed',
    'Execution Date': date.today().isoformat(),
    'Notes': 'Headed Playwright run; see test-results folder'
}

def make_base_xlsx(path, first_record):
    with zipfile.ZipFile(path, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', '''<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
 <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
 <Default Extension="xml" ContentType="application/xml"/>
 <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
 <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
 <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>''')
        z.writestr('_rels/.rels', '''<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
 <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="/xl/workbook.xml"/>
</Relationships>''')
        z.writestr('xl/workbook.xml', '''<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
 <sheets><sheet name="Summary" sheetId="1" r:id="rId1"/></sheets>
</workbook>''')
        z.writestr('xl/_rels/workbook.xml.rels', '''<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
 <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
 <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>''')
        # header row + optional first record
        sheet_rows = []
        sheet_rows.append('  <row r="1">')
        headers = ['Test Name','Target URL','Status','Execution Date','Notes']
        for i, h in enumerate(headers, start=1):
            col = chr(ord('A') + i - 1)
            sheet_rows.append(f'   <c r="{col}1" t="inlineStr"><is><t>{h}</t></is></c>')
        sheet_rows.append('  </row>')
        if first_record:
            sheet_rows.append('  <row r="2">')
            for i, h in enumerate(headers, start=1):
                col = chr(ord('A') + i - 1)
                v = first_record.get(h, '')
                sheet_rows.append(f'   <c r="{col}2" t="inlineStr"><is><t>{v}</t></is></c>')
            sheet_rows.append('  </row>')
        sheet_xml = '<?xml version="1.0" encoding="UTF-8"?>\n<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n <sheetData>\n' + '\n'.join(sheet_rows) + '\n </sheetData>\n</worksheet>'
        z.writestr('xl/worksheets/sheet1.xml', sheet_xml)
        z.writestr('xl/styles.xml', '''<?xml version="1.0" encoding="UTF-8"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
 <fonts count="1"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/></font></fonts>
 <fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>
 <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
 <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
 <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
</styleSheet>''')

def append_row(path, record):
    # read existing worksheet
    with zipfile.ZipFile(path, 'r') as z:
        sheet = z.read('xl/worksheets/sheet1.xml').decode('utf-8')
        others = {name: z.read(name) for name in z.namelist() if name != 'xl/worksheets/sheet1.xml'}

    # find current max row index
    import re
    rows = re.findall(r'<row r="(\d+)">', sheet)
    max_r = max([int(r) for r in rows]) if rows else 1
    new_r = max_r + 1

    headers = ['Test Name','Target URL','Status','Execution Date','Notes']
    new_row = [f'  <row r="{new_r}">']
    for i, h in enumerate(headers, start=1):
        col = chr(ord('A') + i - 1)
        v = record.get(h, '')
        new_row.append(f'   <c r="{col}{new_r}" t="inlineStr"><is><t>{v}</t></is></c>')
    new_row.append('  </row>')

    # insert before </sheetData>
    sheet_updated = sheet.replace('\n </sheetData>', '\n' + '\n'.join(new_row) + '\n </sheetData>')

    # write back zip
    with zipfile.ZipFile(path, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for name, data in others.items():
            z.writestr(name, data)
        z.writestr('xl/worksheets/sheet1.xml', sheet_updated)

if not path.exists():
    make_base_xlsx(path, record)
    print(f'Created {path} with initial execution row')
else:
    append_row(path, record)
    print(f'Appended execution row to {path}')
