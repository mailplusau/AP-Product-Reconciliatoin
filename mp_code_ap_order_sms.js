/**
 * Module Description
 * 
 * NSVersion    Date                    Author         
 * 1.00         2018-01-10 11:53:04         Ankith 
 *
 * Remarks:         
 * 
 * @Last Modified by:   mailplusar
 * @Last Modified time: 2018-01-10 11:57:14
 *
 */


var order = 'customrecord_mp_ap_product_order';
var bill = 'customrecord_mp_ap_stock_receipt';
var line = 'customrecord_ap_stock_line_item';

//Init array for storing all relevant order/bill list
var order_list = [];
var bill_list = [];

var a_unmatching_File = '';
var a_product_mappings_array = '';
var i_pr_mappings_ID;

var GLOBAL_bill_list = [];

function unmatchRec() {
    var type = nlapiGetRecordType();
    var id = nlapiGetRecordId();

    main_unmatch(type, id);

}

// type --> AP Product Order or AP Stock Receipt or AP Line Item
function main_unmatch(type, id) {

    if (type == line) {

        var lineRec = nlapiLoadRecord(type, id);

        if (!isNullorEmpty(lineRec.getFieldValue('custrecord_ap_stock_line_stock_receipt'))) {
            main_unmatch(bill, lineRec.getFieldValue('custrecord_ap_stock_line_stock_receipt'));
        }

        if (!isNullorEmpty(lineRec.getFieldValue('custrecord_ap_product_order'))) {
            main_unmatch(order, lineRec.getFieldValue('custrecord_ap_product_order'));
        }
    }


    if (type == order || type == bill) {

        //Load Search of all recon'ed AP Line Items affiliated to order or bill
        var lineSearch = nlapiLoadSearch(line, 'customsearch_ap_recon_d_ap_line_item');


        var fil_line = [];
        if (type == order) {
            order_list.push(id);
            var orderRecord = nlapiLoadRecord(order, id);
            var partner = orderRecord.getFieldValue('custrecord_mp_ap_order_franchisee');

            var mappingsSearch = nlapiLoadSearch('customrecord_pr_mappings', 'customsearch_ap_prod_recon_mappings');

            var a_filters = new Array();
            a_filters[a_filters.length] = new nlobjSearchFilter('custrecord_partner_user', null, 'is', partner);

            mappingsSearch.addFilters(a_filters);

            var mappingsSearchResult = mappingsSearch.runSearch();

            var mappingsResult = mappingsSearchResult.getResults(0, 1);

            if (mappingsResult.length != 0) {
                i_pr_mappings_ID = mappingsResult[0].getValue('internalid')
            }
            fil_line[fil_line.length] = new nlobjSearchFilter('custrecord_ap_product_order', null, 'anyof', order_list);
        } else {
            bill_list.push(id);
            var billRecord = nlapiLoadRecord(bill, id);
            var partner = billRecord.getFieldValue('custrecord_ap_franchisee');

            var mappingsSearch = nlapiLoadSearch('customrecord_pr_mappings', 'customsearch_ap_prod_recon_mappings');

            var a_filters = new Array();
            a_filters[a_filters.length] = new nlobjSearchFilter('custrecord_partner_user', null, 'is', partner);

            mappingsSearch.addFilters(a_filters);

            var mappingsSearchResult = mappingsSearch.runSearch();

            var mappingsResult = mappingsSearchResult.getResults(0, 1);

            if (mappingsResult.length != 0) {
                i_pr_mappings_ID = mappingsResult[0].getValue('internalid')
            }
            fil_line[fil_line.length] = new nlobjSearchFilter('custrecord_ap_stock_line_stock_receipt', null, 'anyof', bill_list);
        }

        //run loaded line search with fiter
        lineSearch.addFilters(fil_line);
        var lineResult = lineSearch.runSearch();

        //run unmatch function for each search result (AP Line Items)
        lineResult.forEachResult(unmatchLine);

        //unmatch main record(s) & call back function for counter records
        if (type == order && order_list.length > 0) {

            var orderSearch = nlapiLoadSearch(order, 'customsearch_ap_recon_d_ap_pdt_order');

            var fil_order = [];
            fil_order[fil_order.length] = new nlobjSearchFilter('internalid', null, 'anyof', order_list);

            orderSearch.addFilters(fil_order);

            var orderResult = orderSearch.runSearch();

            orderResult.forEachResult(function(searchResult) {

                var orderRec = nlapiLoadRecord(order, searchResult.getValue('internalid'));

                orderRec.setFieldValue('custrecord_ap_order_recon_status', null);
                orderRec.setFieldValue('custrecord_ap_p_color', null);
                orderRec.setFieldValue('custrecord_mapping_reconcilliation_statu', null);

                nlapiSubmitRecord(orderRec);

                return true;
            });

            order_list = [];

        } else if (type == bill && bill_list.length > 0) {

            var s_unmatch_content_ar = '';
            var a_product_mappings_array_ar = '';
            var old_bill_id;
            var old_po_id;

            var billSearch = nlapiLoadSearch(bill, 'customsearch_ap_recon_d_ap_bills');

            var fil_bill = [];
            fil_bill[fil_bill.length] = new nlobjSearchFilter('internalid', null, 'anyof', bill_list);

            billSearch.addFilters(fil_bill);

            var billResult = billSearch.runSearch();

            billResult.forEachResult(function(searchResult) {

                GLOBAL_bill_list.push(searchResult.getValue('internalid'));

                var billRec = nlapiLoadRecord(bill, searchResult.getValue('internalid'));

                billRec.setFieldValue('custrecord_ap_stock_recon_status', null);
                billRec.setFieldValue('custrecord_ap_s_color', null);
                billRec.setFieldValue('custrecord_bill_mapping_reconcilliation', null);

                nlapiSubmitRecord(billRec);

                return true;

            });

            bill_list = [];
        }

        if (type == order && bill_list.length > 0 && order_list.length == 0) {

            //callback main function for order/bill
            main_unmatch(bill, bill_list[0]);

        } else if (type == bill && order_list.length > 0 && bill_list.length == 0) {

            //callback main function for orders
            main_unmatch(order, order_list[0]);
            // }
        } else if (order_list.length == 0 && bill_list.length == 0) {

            var mappingRecord = nlapiLoadRecord('customrecord_pr_mappings', i_pr_mappings_ID);

            mappingRecord.setFieldValue('custrecord_unmatched_bills', GLOBAL_bill_list.toString());
            // mappingRecord.setFieldValue('custrecord_apbill_approduct_mappings', a_product_mappings_array_ar);

            nlapiSubmitRecord(mappingRecord);
        }
    }
}

function unmatchLine(eachResult) {

    var id = eachResult.getValue('internalid');
    var lineRec = nlapiLoadRecord(line, id);

    lineRec.setFieldValue('custrecord_ap_line_recon_status', null);
    lineRec.setFieldValue('custrecord_ap_is_matching_done', null);
    lineRec.setFieldValue('custrecord_ap_line_unrecon_qty', null);

    //if AP Product Order, capture Reconciled AP Bills into bill_list and set Reconciled AP Bill to null
    if (!isNullorEmpty(lineRec.getFieldValues('custrecord_reconciled_ap_bill')) && isNullorEmpty(lineRec.getFieldValues('custrecord_reconciled_product_order'))) {
        bill_list = bill_list.concat(lineRec.getFieldValues('custrecord_reconciled_ap_bill'));
        //bill_list.push(lineRec.getFieldValues('custrecord_reconciled_ap_bill'));
        lineRec.setFieldValues('custrecord_reconciled_ap_bill', null);
    }

    //if AP Bill, capture Reconciled AP Product Order into order_list and set Reconciled AP Product Order
    if (!isNullorEmpty(lineRec.getFieldValues('custrecord_reconciled_product_order')) && isNullorEmpty(lineRec.getFieldValues('custrecord_reconciled_ap_bill'))) {
        order_list = order_list.concat(lineRec.getFieldValues('custrecord_reconciled_product_order'));
        //order_list.push(lineRec.getFieldValues('custrecord_reconciled_product_order'));
        lineRec.setFieldValues('custrecord_reconciled_product_order', null);
    }

    nlapiSubmitRecord(lineRec);

    return true;
}

/**
 * Sends a sms.
 */

function sendSMS() {

    var ctx = nlapiGetContext();
    var rec = nlapiLoadRecord('customrecord_mp_ap_product_order', nlapiGetRecordId());
    var env = ctx.getEnvironment();

    var customerID = nlapiGetFieldValue('custrecord_ap_order_customer');

    if (customerID == "") {

        alert("record needs to be associated with an existing customer");

        return;
    }

    var customer = nlapiLoadRecord('customer', customerID);

    var customerName = customer.getFieldValue('altname');
    var customerAddress1 = customer.getFieldValue('shipaddr1');
    var customerAddress2 = customer.getFieldValue('shipaddr2');

    customer.setFieldValue('custentity_m_sale_processed', 'T');
    var id = nlapiSubmitRecord(customer, true);


    var customerAddress = "";
    if (customerAddress1) {
        customerAddress += customerAddress1 + " ";
    }
    if (customerAddress2) {
        customerAddress += customerAddress2;
    }

    var qdl = nlapiGetFieldValue('custrecord_ap_order_qtydl');
    var qc5 = nlapiGetFieldValue('custrecord_ap_order_qtyc5');
    var qb4 = nlapiGetFieldValue('custrecord_ap_order_qtyb4');
    var q500 = nlapiGetFieldValue('custrecord_ap_order_qty500g');
    var q1k = nlapiGetFieldValue('custrecord_ap_order_qty1kg');
    var q3k = nlapiGetFieldValue('custrecord_ap_order_qty3kg');
    var q5k = nlapiGetFieldValue('custrecord_ap_order_qty5kg');
    var qsod = nlapiGetFieldValue('custrecord_ap_order_qtysod');

    var stat = nlapiGetFieldValue('custrecord_mp_ap_order_order_status');

    if (q500 == "") {
        q500 = 0;
    }

    var person = nlapiGetFieldValue('custrecord_mp_ap_order_ordered_by');

    var pre = "";
    if (env == "SANDBOX") {
        pre = "TEST: ";
    }

    var type = "order";

    if (stat == "7") {
        type = "return";
    }

    var fil_po = [];
    // fil_po[fil_po.length] = new nlobjSearchFilter('custrecord_ap_lodgement_site_state', null, 'is', nlapiLoadRecord('partner', recCustomer.getFieldValue('partner')).getFieldValue('location'));
    fil_po[fil_po.length] = new nlobjSearchFilter('custrecord_ap_product_order', null, 'is', nlapiGetRecordId());


    var col_po = [];
    // col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_item_category');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_stock_line_item');
    col_po[col_po.length] = new nlobjSearchColumn('custrecord_ap_stock_line_actual_qty');

    var poSearch = nlapiSearchRecord('customrecord_ap_stock_line_item', null, fil_po, col_po);

    var message = ''
    for (var x = 0; x < poSearch.length; x++) {
        if (x == 0) {
            message += pre + poSearch[x].getText('custrecord_ap_stock_line_item') + " Qty - " + poSearch[x].getValue('custrecord_ap_stock_line_actual_qty');
        } else {
            message += "," + poSearch[x].getText('custrecord_ap_stock_line_item') + " Qty - " + poSearch[x].getValue('custrecord_ap_stock_line_actual_qty');
        }
    }

    // var message = pre + "Satchel " + type + " (in 10-packs): ";

    // if (qdl > 0) {
    //     message += qdl + " x DL";
    // }
    // if (qc5 > 0) {
    //     message += ", " + qc5 + " x C5";
    // }
    // if (qb4 > 0) {
    //     message += ", " + qb4 + " x B4";
    // }
    // if (q500 > 0) {
    //     message += ", " + q500 + " x 500g";
    // }
    // if (q1k > 0) {
    //     message += ", " + q1k + " x 1kg";
    // }
    // if (q3k > 0) {
    //     message += ", " + q3k + " x 3kg";
    // }
    // if (q5k > 0) {
    //     message += ", " + q5k + " x 5kg";
    // }
    // if (qsod > 0) {
    //     message += "and " + qsod + " piece(s) of SOD labels";
    // }

    if (person != "") {
        message += ". - " + person + " at " + customerName + " addr: " + customerAddress + ".";
    } else {
        message += ". - " + customerName + " addr: " + customerAddress + ".";
    }

    var encmessage = escape(message);
    var franchiseeID = customer.getFieldValue('partner');
    var franchisee = nlapiLoadRecord('partner', franchiseeID);
    var mobile = (franchisee.getFieldValue('custentity2')).toString();

    if (franchisee == null) {
        alert("couldn't find franchisee");
    }

    if (mobile != null) {
        // update the order status.
        nlapiSetFieldValue('custrecord_mp_ap_order_order_status', '2');

        var length = encmessage.length;

        if (length > 160) {

            var outputString = splitter(encmessage, 155);

            for (var i = 0; i < outputString.length; i++) {
                mobile = mobile.replace(/ /g, '');
                var final_message = '[' + (i + 1) + ' of ' + outputString.length + ' SMS] - ' + outputString[i]
                window.open("http://www.mplamp.net/mailplus_satchels/sms_relay_toll.php?a=" + mobile + "&m=" + final_message);
            }

        } else {
            mobile = mobile.replace(/ /g, '');
            window.open("http://www.mplamp.net/mailplus_satchels/sms_relay_toll.php?a=" + mobile + "&m=" + encmessage);
        }


    } else {

        alert("couldn't find franchisee mobile");

    }

}

function splitter(str, l) {
    var strs = [];
    while (str.length > l) {
        var pos = str.substring(0, l).lastIndexOf(' ');
        pos = pos <= 0 ? l : pos;
        strs.push(str.substring(0, pos));
        var i = str.indexOf(' ', pos) + 1;
        if (i < pos || i > pos + l)
            i = pos;
        str = str.substring(i);
    }
    strs.push(str);
    return strs;
}

function callZee() {
    nlapiSetFieldValue('custrecord_mp_ap_order_order_status', '3');
}

function deleteRec() {
    var id = nlapiGetRecordId();
    if (!isNullorEmpty(nlapiGetFieldValue('custrecord_mp_ap_order_invoicenum')) | !isNullorEmpty(nlapiGetFieldValue('custrecord_mp_ap_order_creditnum'))) {
        throw nlapiCreateError('RECORD_LOCKED', 'Record Cannot be deleted: \n\nThis AP Product Order has been Invoiced/Credited and cannot be Deleted. \nPlease review before deleting.', true);
    }

    var fil = [];
    fil[fil.length] = new nlobjSearchFilter('custrecord_ap_product_order', null, 'is', id);

    var col = [];
    col[col.length] = new nlobjSearchColumn('internalid');

    var itemSearch = nlapiSearchRecord('customrecord_ap_stock_line_item', null, fil, col);

    for (var i = 0; i < itemSearch.length; i++) {
        nlapiDeleteRecord('customrecord_ap_stock_line_item', itemSearch[i].getValue('internalid'));
    }

    nlapiDeleteRecord('customrecord_mp_ap_product_order', id);
    var url = nlapiResolveURL('TASKLINK', 'CARD_-29');
    return url;
}