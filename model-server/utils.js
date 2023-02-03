export let symbols = ['AAPL','MSFT','GOOG','GOOGL','AMZN','BRK/A','BRK/B','JNJ','V','UNH','XOM','TSM','JPM','WMT','NVDA','PG','TSLA','MA','LLY','CVX','HD','NVO','ABBV','META','MRK','PFE','BABA','BAC','KO','PEP','AVGO','ASML','ORCL','GEN','AZN','COST','TMO','SHEL','NVS','CSCO','MCD','ABT','NKE','TM','TMUS','DHR','VZ','DIS','ACN','BHP','NEE','CMCSA','WFC','PM','TXN','SCHW','LIN','BMY','UPS','ADBE','TTE','RTX','MS','COP','AMGN','HON','CRM','NFLX','T','HSBC','RY','UNP','IBM','CAT','QCOM','UL','SAP','DE','BA','HDB','LMT','BUD','SBUX','LOW','PDD','SNY','CVS','RIO','INTC','GS','TD','ELV','SPGI','AXP','BLK','GILD','INTU','PLD','MDT','BP','AMD','EIX','AMT','DEO','GE','JD','SONY','ADP','EQNR','SYK','TJX','ISRG','CB','EL','MDLZ','CI','C','BTI','MUFG','AMAT','PYPL','MMC','BKNG','ADI','MO','CNI','VALE','ENB','DUK','REGN','NOC','PGR','SO','SLB','CHTR','EOG','INFY','VRTX','IBN','NOW','BDX','TGT','CP','HCA','GSK','USB','MMM','ITW','MRNA','APD','ZTS','GD','CSX','BN','PBR','BMO','CL','BSX','PNC','WM','FISV','ETN','AON','UBS','CCI','CME','EQIX','HUM','MU','AMX','SHW','TFC','LRCX','ATVI','ABB','FCX','CNQ','AMOV','BNS','NSC','ICE','BX','OXY','MET','EMR','KLAC','TRI','AIG','DG','PXD','SMFG','MPC','MCK','EPD','RELX','SAN','VMW','NTES','MNST','MCO']
export let names = ["Apple","Microsoft","Alphabet","Alphabet Inc.","Amazon.com","Johnson Johnson","Visa","UnitedHealth","Exxon Mobil","Taiwan Semiconductor Manufacturing","JPMorgan Chase","Walmart","NVIDIA","Procter Gamble","Tesla","Mastercard","Eli Lilly","Chevron","The Home Depot","Novo Nordisk AS","AbbVie","Meta","Merck","Pfizer","Alibaba","Bank of America","Coca-Cola","PepsiCo","Broadcom","ASML Holding","Oracle","Gen Digital Inc.","AstraZeneca","Costco Wholesale","Thermo Fisher Scientific","Shell","Novartis AG","Cisco Systems","McDonald's","Abbott Laboratories","NIKE","Toyota Motor","T-Mobile US","Danaher","Verizon Communications","Walt Disney Company","Accenture","BHP","NextEra","Comcast","Wells Fargo","Philip Morris","Texas Instruments","The Charles Schwab","Linde","Bristol-Myers Squibb","United Parcel Service","Adobe","TotalEnergies SE","Raytheon","Morgan Stanley","ConocoPhillips","Amgen","Honeywell","Salesforce","Netflix","AT\&T","HSBC Holdings, plc.","Royal Bank Of Canada","Union Pacific","IBM","Caterpillar","QUALCOMM","Unilever","SAP SE","Deere","Boeing","HDFC Bank","Lockheed Martin","Anheuser-Busch Inbev SA Sponsor","Starbucks","Lowe's Companies","Pinduoduo","Sanofi","CVS Health","Rio Tinto","Intel","The Goldman Sachs","Toronto Dominion Bank (The)","Elevance Health","S&P Global","American Express","BlackRock","Gilead Sciences","Intuit","Prologis","Medtronic","BP p.l.c","Advanced Micro Devices","Edison","American Tower Corporation (REI","Diageo","General Electric","JD.com","Sony","Automatic Data Processing","Equinor ASA","Stryker","The TJX Companies","Intuitive Surgical","Chubb","The Estée Lauder Companies","Mondelez","Cigna","Citigroup","British American Tobacco Indus","Mitsubishi UFJ Financial Group,","Applied Materials","PayPal","Marsh McLennan Companies","Booking","Analog Devices","Altria","Canadian National Railway Compa","Vale","Enbridge Inc","Duke Energy","Regeneron Pharmaceuticals","Northrop Grumman","The Progressive","Southern","Schlumberger","Charter Communications","EOG Resources","Infosys","Vertex Pharmaceuticals Incorpor","ICICI Bank","ServiceNow","Becton, Dickinson","Target","Canadian Pacific Railway","HCA Healthcare","GSK plc","U.S. Bancorp","3M","Illinois Tool Works","Moderna","Air Products Chemicals","Zoetis","General Dynamics","CSX","Brookfield","Petroleo Brasileiro S.A.- Petro","Bank Of Montreal","Colgate-Palmolive","Boston Scientific Corporation","The PNC Financial Services","Waste Management","Fiserv","Eaton","Aon","UBS Group AG Registered","Crown Castle Inc.","CME","Equinix, Inc.","Humana","Micron Technology","America Movil, S.A.B. de C.V. A","Sherwin-Williams","Truist Financial Corporation","Lam Research","Activision Blizzard","ABB","Freeport-McMoRan","Canadian Natural Resources","América Móvil, S.A.B. de C.V","Bank Nova Scotia Halifax Pfd 3","Norfolk Southern","Intercontinental Exchange","Blackstone","Occidental Petroleum","MetLife","Emerson Electric","KLA","Thomson Reuters","American","Dollar General","Pioneer Natural Resources Compa","Sumitomo Mitsui Financial","Marathon Petroleum","McKesson","Enterprise Products Partners L.P","RELX","Banco Santander, S.A. Sponsored","VMware","NetEase","Monster Beverage","Moody's"]
let contexts = ["166.*", "67.847894852779900928", "131.847894852779900928", "131.864154902926196737"]

const getValue = (x,y, idx) => {
    return `(${symbols.slice(x,y).join(" OR ")} OR ${names.slice(x,y).join(" OR ")}) (context:${contexts.join(" OR context:")})  lang:en -is:retweet`
}

export const ruleExtractor = () => {
    let rules = [];

    for (let i = 0; i<5; i++){
        rules.push({'value': getValue(i*15,i*15+15, i), 'tag':i})
    }
    return rules
}