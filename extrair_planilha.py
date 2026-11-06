import openpyxl, json, re, collections, sys
import os
HERE=os.path.dirname(os.path.abspath(__file__))
p=sys.argv[1] if len(sys.argv)>1 else sys.exit('uso: python3 scripts/extrair_planilha.py caminho/da/planilha.xlsx')
wb=openpyxl.load_workbook(p,data_only=True)
def yn(v): return True if v=='Sim' else (False if v=='Não' else None)
def num(v): return v if isinstance(v,(int,float)) else None
mcc={}
for r in wb['Link de pagamento'].iter_rows(min_row=2,values_only=True):
    if r[0] is None: continue
    c=int(r[0]); mcc[c]={'n':r[1].strip(),'l':{'on':yn(r[2]),'d1':yn(r[3]),'d30':yn(r[4]),'tds':yn(r[5]),'cs':yn(r[6]),'min3':num(r[7]),'max':num(r[8])}}
for r in wb['API (Venda online e banking)'].iter_rows(min_row=2,values_only=True):
    if r[1] is None: continue
    c=int(r[1])
    e=mcc.setdefault(c,{'n':r[2].strip(),'l':None})
    e['a']={'bank':yn(r[3]),'on':yn(r[4]),'tds':yn(r[5]),'cs':yn(r[6]),'min3':num(r[7]),'only3':num(r[8]),'obs':r[9]}
print('mcc total',len(mcc),'sem api',[c for c,v in mcc.items() if 'a' not in v],'sem link',[c for c,v in mcc.items() if v['l'] is None])
cn=[]; missing=collections.Counter(); multi=[]
for r in wb['CNAExMCC'].iter_rows(min_row=2,values_only=True):
    if not r[0]: continue
    raw=r[2]
    codes=[int(x) for x in re.findall(r'\d+',str(raw))] if isinstance(raw,str) else [int(raw)]
    if len(codes)>1: multi.append((r[0],r[1],codes))
    for c in codes:
        if c not in mcc: missing[c]+=1
    cn.append([r[0].strip(),r[1].strip(),codes])
print('cnae',len(cn),'multi',len(multi)); print(multi[:6])
print('mcc missing from tables',dict(missing))
used={c for _,_,cs in cn for c in cs}
print('mcc in tables but unused by any cnae',len(set(mcc)-used))
# consistency: api on Sim but link on Não etc
odd=[(c,v['n'],v['l']['on'],v['a']['on']) for c,v in mcc.items() if v.get('a') and v['l'] and v['a']['on'] and not v['l']['on']]
print('api sim but link nao',odd[:10],len(odd))
odd2=[(c,v['n']) for c,v in mcc.items() if v.get('a') and v['a']['bank']==False and v['a']['on']]
print('bank nao mas api on sim',len(odd2))
print(collections.Counter((v['a']['bank'],v['a']['on']) for v in mcc.values() if v.get('a')))
json.dump({'mcc':{str(k):v for k,v in mcc.items()},'cnae':cn},open(os.path.join(HERE,'..','src','data.json'),'w'),ensure_ascii=False,separators=(',',':'))
print(os.path.getsize(os.path.join(HERE,'..','src','data.json')))
