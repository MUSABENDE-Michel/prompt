const XLSX = require('xlsx');

const generateExcel = (records, type) => {
  const headers = getHeaders(type);
  const rows = records.map((r) => mapRecord(r, type));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, type);
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
};

const getHeaders = (type) => {
  switch (type) {
    case 'customers':
      return ['Number', 'First Name', 'Last Name', 'Telephone', 'Address'];
    case 'products':
      return ['Code', 'Name', 'Qty Sold', 'Unit Price', 'Total Value'];
    case 'sales':
    default:
      return ['Invoice', 'Customer', 'Date', 'Payment', 'Total'];
  }
};

const mapRecord = (record, type) => {
  switch (type) {
    case 'customers':
      return [record.customerNumber, record.firstName, record.lastName, record.telephone, record.address];
    case 'products':
      return [record.productCode, record.productName, record.quantitySold, record.unitPrice, record.quantitySold * record.unitPrice];
    case 'sales':
    default:
      return [
        record.invoiceNumber,
        record.customer ? `${record.customer.firstName || ''} ${record.customer.lastName || ''}` : 'N/A',
        record.salesDate ? new Date(record.salesDate).toLocaleDateString() : '',
        record.paymentMethod,
        record.totalAmountPaid,
      ];
  }
};

module.exports = { generateExcel, getHeaders };
