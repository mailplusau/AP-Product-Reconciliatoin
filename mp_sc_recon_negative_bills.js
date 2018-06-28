var baseURL = 'https://system.na2.netsuite.com';
if (nlapiGetContext().getEnvironment() == "SANDBOX") {
	baseURL = 'https://system.sandbox.netsuite.com';
}

function reconNegativeAPBills() {
	var searched_negative_bills = nlapiLoadSearch('customrecord_ap_stock_line_item', 'customsearch_ap_recon_billcredits');

	var resultSet_negative_bills = searched_negative_bills.runSearch();


	resultSet_negative_bills.forEachResult(function(searchResult) {

		var negative_bill_line_item_id = searchResult.getValue('internalid');
		var negative_bill_ap_item = searchResult.getValue('custrecord_ap_stock_line_item');
		var negative_bill_ap_item_descp = searchResult.getValue('custrecord_ap_bill_item_description');
		var negative_bill_ap_item_qty = (searchResult.getValue('custrecord_ap_stock_line_billed_qty'));
		var negative_bill_total_amt = searchResult.getValue('custrecord_ap_bill_amt_total');
		var negative_bill_id = searchResult.getValue("internalid", "CUSTRECORD_AP_STOCK_LINE_STOCK_RECEIPT", null);
		var negative_bill_date = searchResult.getValue("custrecord_ap_bill_date", "CUSTRECORD_AP_STOCK_LINE_STOCK_RECEIPT", null);
		var negative_bill_zee = searchResult.getValue("custrecord_ap_franchisee", "CUSTRECORD_AP_STOCK_LINE_STOCK_RECEIPT", null);

		var positive_qty = -(negative_bill_ap_item_qty);

		nlapiLogExecution('DEBUG', 'negative_bill_ap_item_qty', negative_bill_ap_item_qty);
		nlapiLogExecution('DEBUG', 'positive_qty', positive_qty);



		var searched_recon_bills = nlapiLoadSearch('customrecord_ap_stock_line_item', 'customsearch_ap_recon_bills');

		var newFilters = new Array();

		newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_ap_stock_line_item', null, 'is', negative_bill_ap_item);
		newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_ap_stock_line_billed_qty', null, 'equalto', positive_qty);
		newFilters[newFilters.length] = new nlobjSearchFilter('custrecord_ap_bill_item_description', null, 'is', negative_bill_ap_item_descp);
		newFilters[newFilters.length] = new nlobjSearchFilter("custrecord_ap_bill_date", "CUSTRECORD_AP_STOCK_LINE_STOCK_RECEIPT", 'onorbefore', nlapiStringToDate(negative_bill_date));
		newFilters[newFilters.length] = new nlobjSearchFilter("custrecord_ap_franchisee", "CUSTRECORD_AP_STOCK_LINE_STOCK_RECEIPT", 'is', negative_bill_zee);

		searched_recon_bills.addFilters(newFilters);


		var resultSet_recon_bills = searched_recon_bills.runSearch();

		var reconResult = resultSet_recon_bills.getResults(0, 1);

		if (!isNullorEmpty(reconResult)) {
			for (var y = 0; y < reconResult.length; y++) {



				var bill_line_item_id = reconResult[y].getValue('internalid');
				var bill_ap_item = reconResult[y].getValue('custrecord_ap_stock_line_item');
				var bill_ap_item_descp = reconResult[y].getValue('custrecord_ap_bill_item_description');
				var bill_ap_item_qty = reconResult[y].getValue('custrecord_ap_stock_line_billed_qty');
				var bill_total_amt = reconResult[y].getValue('custrecord_ap_bill_amt_total');
				var bill_id = reconResult[y].getValue("internalid", "CUSTRECORD_AP_STOCK_LINE_STOCK_RECEIPT", null);
				var bill_date = reconResult[y].getValue("custrecord_ap_bill_date", "CUSTRECORD_AP_STOCK_LINE_STOCK_RECEIPT", null);

				nlapiLogExecution('DEBUG', 'bill_id', bill_id);
				nlapiLogExecution('DEBUG', 'negative_bill_id', negative_bill_id);

				var billLineItemRecord = nlapiLoadRecord('customrecord_ap_stock_line_item', bill_line_item_id);

				billLineItemRecord.setFieldValue('custrecord_ap_line_recon_status', 1);
				billLineItemRecord.setFieldValues('custrecord_reconciled_ap_bill', [negative_bill_id]);
				billLineItemRecord.setFieldValue('	custrecord_ap_line_unrecon_qty', '0');
				billLineItemRecord.setFieldValue('custrecord_ap_is_matching_done', 'T');

				nlapiSubmitRecord(billLineItemRecord);

				var negativeBillLineItemRecord = nlapiLoadRecord('customrecord_ap_stock_line_item', negative_bill_line_item_id);

				negativeBillLineItemRecord.setFieldValue('custrecord_ap_line_recon_status', 1);
				negativeBillLineItemRecord.setFieldValues('custrecord_reconciled_ap_bill', [bill_id]);
				negativeBillLineItemRecord.setFieldValue('	custrecord_ap_line_unrecon_qty', '0');
				negativeBillLineItemRecord.setFieldValue('custrecord_ap_is_matching_done', 'T');

				nlapiSubmitRecord(negativeBillLineItemRecord);

				var searchedNegativeBills = nlapiLoadSearch('customrecord_ap_stock_line_item', 'customsearch_ap_recon_billcredits');

				var newFilters = new Array();

				newFilters[newFilters.length] = new nlobjSearchFilter("internalid", "CUSTRECORD_AP_STOCK_LINE_STOCK_RECEIPT", 'is', negative_bill_id);

				searchedNegativeBills.addFilters(newFilters);

				var resultSetNegativeBills = searchedNegativeBills.runSearch();

				var negativeBillsResult = resultSetNegativeBills.getResults(0, 1);

				if(negativeBillsResult.length == 0){
					var negativeBillRecord = nlapiLoadRecord('customrecord_mp_ap_stock_receipt', negative_bill_id);

					negativeBillRecord.setFieldValue('custrecord_ap_stock_recon_status', 1);
					negativeBillRecord.setFieldValue('custrecord_ap_s_color', 1);
					negativeBillRecord.setFieldValue('custrecord_bill_mapping_reconcilliation', 1);

					nlapiSubmitRecord(negativeBillRecord);
				}

				var searchedBills = nlapiLoadSearch('customrecord_ap_stock_line_item', 'customsearch_ap_recon_bills');

				var newFilters = new Array();

				newFilters[newFilters.length] = new nlobjSearchFilter("internalid", "CUSTRECORD_AP_STOCK_LINE_STOCK_RECEIPT", 'is', bill_id);

				searchedBills.addFilters(newFilters);

				var resultSetBills = searchedBills.runSearch();

				var billsResult = resultSetBills.getResults(0, 1);

				if(billsResult.length == 0){
					var billRecord = nlapiLoadRecord('customrecord_mp_ap_stock_receipt', bill_id);

					billRecord.setFieldValue('custrecord_ap_stock_recon_status', 1);
					billRecord.setFieldValue('custrecord_ap_s_color', 1);
					billRecord.setFieldValue('custrecord_bill_mapping_reconcilliation', 1);

					nlapiSubmitRecord(billRecord);
				}


			}
		}



		return true;
	});

}