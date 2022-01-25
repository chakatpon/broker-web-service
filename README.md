# Broker Web-Service API

CRUD RESTFUL API using Node JS, Express JS, and Redis.

## API Features

```
1. Pre-Validate Data Infomation.

```

## Getting Started

Ensure Redis is Installed and running on the machine.

1. `git clone https://gitlab2.viriyah.co.th/chakatponk/broker-web-service.git`
2. `cd broker-web-service`
3. `npm install`
4. set up env variables: redis Host, redis Port, Server Port, Node env
5. `npm start`

The above will get you a copy of the project up and running on your local machine for development and testing purposes.

## Dependencies

```
  1. REDIS
  2. NodeJS
  3. ExpressJS
```

## API Endpoints

All API endpoints return a status code of 200 for successful calls and 400 including an error object for unsuccessful calls.

```
| EndPoint                                |   Functionality                      |
| --------------------------------------- | ------------------------------------:|
| POST /wsPolicyDetail_AH/preApprove      | Pre-Validate Info                    |
|                                         |                                      |

```

## Create Pre-Validation Example

To Create a Pre-Validation , Provide the mocking infomation:

```
{
	"COMP_CODE":"2037",
	"POLICYNO":"",
	"PREVIOUSPOLICYNO":"",
	"ENDORSESERIES":0,
	"ENDORSENO":"",
	"ENDORSETYPE":"",
	"ENDORSEDESC":"",
	"QUOTATIONNO":"11-3-20-00006753",
	"APPLICATIONNO":"12-3-20-00008753",
	"BARCODENO":"",
	"COMBINE_LINK_NO":"",
	"NOTIFYDATE":"20201019",
	"ISSUEDATE":"20201019",
	"EFFECTIVEDATE":"20201019",
	"EXPIRYDATE":"20211019",
	"EDEFFECTIVEDATE":"",
	"EDEXPIRYDATE":"",
	"AGREEMENTDATE":"20201019",
	"INSURANCECLASS":"MI",
	"SUBCLASS":"PH",
	"MOTORCLASS":"0",
	"PROJECTCODE":"",
	"PACKAGECODE":"PH1",
	"PLANCODE":"H3A2",
	"SURVEYORFLAG":"0",
	"RENEWALFLAG":"0",
	"SALEDATE":"20201019",
	"CANCELDATE":"",
	"CANCELREASON":"",
	"STATUS":"PRE",
	"POLICYPRINTBY":"1",
	"CHANNEL":"1",
	"INSURED":[
		{
			"PERSONTYPE":"P",
			"TITLENAME":"คุณ",
			"FIRSTNAME":"วี",
			"LASTNAME":"วา",
			"GENDER":"M",
			"BIRTHDATE":"19910901",
			"IDCARDTYPE":"I",
			"IDCARDNO":"6368175328629",
			"IDCARD_EXPDATE":"",
			"COMPVATBRCODE":"A",
			"TELNO1":"",
			"TELNO2":"",
			"FAXNO":"",
			"MOBILE1":"",
			"MOBILE2":"",
			"EMAIL":"sowerasak@bigc.co.th",
			"OCCUPATION":"",
			"MARITALSTATUS":"S",
			"HOUSENO":"1",
			"ADDRESSTEXT":"",
			"MOO":"",
			"SOI":"",
			"ROAD":"พระราม1",
			"SUBDISTRICT":"100703",
			"DISTRICT":"1007",
			"PROVINCE":"10",
			"ZIPCODE":"10330",
			"INSUREDSUFFIX":""
		}
	],
	"DELIVERY":{
		"PERSONTYPE":"P",
		"TITLENAME":"คุณ",
		"FIRSTNAME":"วี",
		"LASTNAME":"วา",
		"HOUSENO":"1",
		"ADDRESSTEXT":"",
		"MOO":"",
		"SOI":"",
		"ROAD":"พระราม1",
		"SUBDISTRICT":"100703",
		"DISTRICT":"1007",
		"PROVINCE":"10",
		"ZIPCODE":"10330"
	},
	"TAXINVOICE":[
		{
			"TAXITEMNO":"1",
			"TAXINVOICENO":"0",
			"DOCUMENTNO":"0",
			"DOCUMENTDATE":"20201019",
			"PERSONTYPE":"P",
			"TITLENAME":"คุณ",
			"FIRSTNAME":"วี",
			"LASTNAME":"วา",
			"IDCARDTYPE":"I",
			"IDCARDNO":"6368175328629",
			"COMPVATBRCODE":"0",
			"HOUSENO":"1",
			"ADDRESSTEXT":"address_text",
			"MOO":"หมู่8",
			"SOI":"ซอย02",
			"ROAD":"พระราม1",
			"SUBDISTRICT":"100703",
			"DISTRICT":"1007",
			"PROVINCE":"10",
			"ZIPCODE":"10330",
			"SUMINSURED":200000.000000,
			"NETGROSSPREMIUM":12201.470000,
			"DUTY":49.000000,
			"TAX":857.530000,
			"TOTALAMOUNT":13108.000000,
			"PREMIUMWHT1FLAG":"N",
			"PREMIUMWHT1NO":"0",
			"PREMIUMWHT1DATE":"0",
			"PREMIUMWHT1AMT":"0.0",
			"PREMIUMWHT1NET":"0",
			"PAYMENTPROCESSFLAG":"1"
		}
	],
	"AGENTSALE":{
		"BROKERCODE":"BCIB",
		"SALECODE":"DEMO20",
		"SALEFIRSTNAME":"DEMO20",
		"SALELASTNAME":"DEMO20"
	},
	"SUMMARY":{
		"NETGROSSPREMIUM":12201.470000,
		"DUTY":49.000000,
		"TAX":857.530000,
		"TOTALPREMIUM":13108.000000,
		"AF_NETGROSSPREMIUM":12201.470000,
		"AF_DUTY":49.000000,
		"AF_TAX":857.530000,
		"AF_TOTALPREMIUM":13108.000000
	},
	"RISK":{
		"ROUTE":"01",
		"TRAVEL_FROM":"ChiangMai",
		"TRAVEL_TO":"Bangkok",
		"SURVEYIMAGEFLAG":"N"
	},
	"PERSON":[
		{
			"PS_SEQNO":1,
			"PS_INSUREDTYPE":"I",
			"PS_TITLENAME":"คุณ",
			"PS_FIRSTNAME":"วี",
			"PS_LASTNAME":"วา",
			"PS_GENDER":"M",
			"PS_BIRTHDATE":"19910901",
			"PS_AGE":29,
			"PS_IDCARDTYPE":"I",
			"PS_IDCARDNO":"6368175328629",
			"PS_PASSPORTNO":"",
			"PS_OCCUPATION":"1019",
			"PS_OCCUPATIONCLASS":"1",
			"PS_TAXID":"6368175328629",
			"PS_MARITALSTATUS":"1",
			"PS_NATIONALITY":"THA",
			"PS_HOUSENO":"1",
			"PS_ADDRESSTEXT":"",
			"PS_MOO":"",
			"PS_SOI":"",
			"PS_ROAD":"พระราม1",
			"PS_SUBDISTRICT":"100703",
			"PS_DISTRICT":"1007",
			"PS_PROVINCE":"10",
			"PS_ZIPCODE":"10330",
			"PS_HEIGHT":170.00,
			"PS_WEIGHT":60.00,
			"PS_SALARY":0.000000,
			"PS_SUMINSURE":200000.000000,
			"PS_GROSSPREM":0.000000,
			"PS_PERILPREM":0.000000,
			"PS_NETGROSSPREM":12201.470000,
			"BNF_PERSONTYPE1":"P",
			"BNF_TITLENAME1":"คุณ",
			"BNF_FIRSTNAME1":"วอ",
			"BNF_LASTNAME1":"วา",
			"BNF_RELATIONSHIP1":"บิดา มารดา",
			"BNF_SUMIN1":0.0,
			"BNF_PERSONTYPE2":"P",
			"BNF_TITLENAME2":"คุณ",
			"BNF_FIRSTNAME2":"เว",
			"BNF_LASTNAME2":"วา",
			"BNF_RELATIONSHIP2":"บิดา มารดา",
			"BNF_SUMIN2":0.0,
			"BNF_PERSONTYPE3":"",
			"BNF_TITLENAME3":"",
			"BNF_FIRSTNAME3":"",
			"BNF_LASTNAME3":"",
			"BNF_RELATIONSHIP3":"",
			"BNF_SUMIN3":0.0,
			"BNF_PERCENTSHARE1":50.00,
			"BNF_PERCENTSHARE2":50.00,
			"BNF_PERCENTSHARE3":0.0,
			"QUESTION":[
				{
					"QUESTIONCODE":"PH01",
					"ANSWER":"N",
					"DETAIL":""
				},
				{
					"QUESTIONCODE":"PH02",
					"ANSWER":"N",
					"DETAIL":""
				},
				{
					"QUESTIONCODE":"PH03",
					"ANSWER":"N",
					"DETAIL":""
				},
				{
					"QUESTIONCODE":"TaxDeduct",
					"ANSWER":"N",
					"DETAIL":""
				}
			]
		}
	],

  "REFERENCE": {
    "REFNAME": "-",
    "REFNO": "-"
  }
}
```

## Pre-Validation Example Response

```
{
    "ReferenceCode": "-",
    "PaymentCode": "",
    "UserName": "DEMO20",
    "AgentCode": "BCIB",
    "SubAgentCode": "DEMO20",
    "PolicyInfo": {
        "PolicyNo": "",
        "CoverageStartDate": "20201019",
        "CoveragePeriodType": "",
        "CoveragePeriod": "",
        "AgreementDate": "20201019",
        "IssueDate": "20201019",
        "SubClassCode": "PH",
        "ProductCode": "PH1",
        "PackageSequence": "",
        "BranchCode": ""
    },
    "InsuredInfo": {
        "InsuredPrefixCode": "คุณ",
        "InsuredFirstName": "วี",
        "InsuredLastName": "วา",
        "InsuredGender": "M",
        "InsuredBirthdate": "19910901",
        "InsuredIdentityCardType": "I",
        "InsuredIdentityCatdNo": "6368175328629",
        "InsuredContactNumber": "",
        "InsuredEmail": "sowerasak@bigc.co.th",
        "InsuredOccupationCode": "",
        "InsuredStatusCode": "S",
        "InsuredPOBox": "1",
        "InsuredBuilding": "",
        "InsuredSoi": "",
        "InsuredStreet": "พระราม1",
        "InsuredSubdistrictCode": "100703",
        "InsuredCityCode": "1007",
        "InsuredProvinceCode": "10",
        "InsuredZipcode": "10330"
    },
    "ReceiptInfo": {
        "ReceiptType": "",
        "ReceiptCompanyText": "0",
        "ReceiptPrefixCode": "คุณ",
        "ReceiptFirstName": "วี",
        "ReceiptLastName": "วา",
        "ReceiptBranch": "",
        "ReceiptBranchNo": "",
        "ReceiptIdentityCardType": "I",
        "ReceiptIdentityCardNo": "6368175328629",
        "ReceiptAddress1": "1 address_text หมู่8 ซอย02 พระราม1",
        "ReceiptAddress2": "100703 1007 10 10330"
    },
    "BeneficiaryInfoList": [
        {
            "BeneficiarySeq": "1",
            "BeneficiaryPrefixCode": "คุณ",
            "BeneficiaryFirstName": "วอ",
            "BeneficiaryLastName": "วา",
            "BeneficiaryBirthdate": "",
            "BeneficiaryContactNumber": "",
            "BeneficiaryRelationShip": "บิดา มารดา",
            "BeneficiaryIndentityCardType": "",
            "BeneficiaryIndentityCardNo": "",
            "BeneficiaryPercent": 50
        },
        {
            "BeneficiarySeq": "2",
            "BeneficiaryPrefixCode": "คุณ",
            "BeneficiaryFirstName": "เว",
            "BeneficiaryLastName": "วา",
            "BeneficiaryBirthdate": "",
            "BeneficiaryContactNumber": "",
            "BeneficiaryRelationShip": "บิดา มารดา",
            "BeneficiaryIndentityCardType": "",
            "BeneficiaryIndentityCardNo": "",
            "BeneficiaryPercent": 50
        },
        {
            "BeneficiarySeq": "3",
            "BeneficiaryPrefixCode": "",
            "BeneficiaryFirstName": "",
            "BeneficiaryLastName": "",
            "BeneficiaryBirthdate": "",
            "BeneficiaryContactNumber": "",
            "BeneficiaryRelationShip": "",
            "BeneficiaryIndentityCardType": "",
            "BeneficiaryIndentityCardNo": "",
            "BeneficiaryPercent": 0
        }
    ]
}
```

The API responds with JSON data by default.
