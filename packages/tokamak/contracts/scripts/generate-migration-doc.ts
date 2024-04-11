import path from 'path'
import { readFile } from 'fs/promises';

import Excel from 'exceljs';

// type Closed = {
//   l1Token : string;
//   l2Token : string;
//   tokenName : string;
//   data : User[];
// }

// type User = {
//   claimer : string;
//   amount : string;
// }
// const out:Closed[] = []; // export assets data

const main = async () => {  
  let json:any;
  try {
    const data = await readFile('./generate-assets.json', 'utf8');
    json = JSON.parse(data);
  } catch(err) {
    console.log(err)
  }
  console.log(json)

  const wb = new Excel.Workbook();
  const worksheet = wb.addWorksheet(json[0].tokenName);

  worksheet.columns = [
    { key: 'accounts', header: 'Accounts' },
    { key: 'amount', header: 'amounts' },
  ];

  // countries.forEach((item) => {
  //   worksheet.addRow(item);
  // });

  const exportPath = path.resolve(__dirname, 'Withdrawal-L1Assets.xlsx');
  await wb.xlsx.writeFile(exportPath);

}



main().catch((error) => {
  console.log(error)
  process.exit(1);
})


// const countries: Country[] = [
//   { name: 'Cameroon', capital: 'Yaounde', countryCode: 'CM', phoneIndicator: 237 },
//   { name: 'France', capital: 'Paris', countryCode: 'FR', phoneIndicator: 33 },
//   { name: 'United States', capital: 'Washington, D.C.', countryCode: 'US', phoneIndicator: 1 },
//   { name: 'India', capital: 'New Delhi', countryCode: 'IN', phoneIndicator: 91 },
//   { name: 'Brazil', capital: 'Brasília', countryCode: 'BR', phoneIndicator: 55 },
//   { name: 'Japan', capital: 'Tokyo', countryCode: 'JP', phoneIndicator: 81 },
//   { name: 'Australia', capital: 'Canberra', countryCode: 'AUS', phoneIndicator: 61 },
//   { name: 'Nigeria', capital: 'Abuja', countryCode: 'NG', phoneIndicator: 234 },
//   { name: 'Germany', capital: 'Berlin', countryCode: 'DE', phoneIndicator: 49 },
// ];

// const exportCountriesFile = async () => {
//   const workbook = new Excel.Workbook();
//   const worksheet = workbook.addWorksheet('Countries List');

//   worksheet.columns = [
//     { key: 'name', header: 'Name' },
//     { key: 'countryCode', header: 'Country Code' },
//     { key: 'capital', header: 'Capital' },
//     { key: 'phoneIndicator', header: 'International Direct Dialling' },
//   ];

//   countries.forEach((item) => {
//     worksheet.addRow(item);
//   });

//   const exportPath = path.resolve(__dirname, 'countries.xlsx');

//   await workbook.xlsx.writeFile(exportPath);
// };
