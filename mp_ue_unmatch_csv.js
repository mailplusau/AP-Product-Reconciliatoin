/**
 * Module Description
 * 
 * NSVersion    Date                    Author         
 * 1.00         2018-01-09 11:53:03         Ankith 
 *
 * Remarks: Mappings Record - Maintain the CSV file and the AP BILL - AP PRODUCT MAPPING field based on the unmatch.        
 * 
 * @Last Modified by:   mailplusar
 * @Last Modified time: 2018-01-10 13:43:43
 *
 */

function afterSubmit() {

    var rec_ID = nlapiGetRecordId();

    var mappingRecord = nlapiLoadRecord('customrecord_pr_mappings', rec_ID);

    var a_unmatching_File = mappingRecord.getFieldValue('custrecord_unmatching_csv_file');
    var unmatching_bills = mappingRecord.getFieldValue('custrecord_unmatched_bills');
    var partner = mappingRecord.getFieldValue('custrecord_partner_user');

    var s_unmatch_content_ar = '';
    var a_product_mappings_array_ar = '';
    var old_bill_id;
    var old_po_id;

    if (!isNullorEmpty(unmatching_bills)) {
        if (!isNullorEmpty(a_unmatching_File)) {
            nlapiLogExecution('DEBUG', 'inside');
            var Obj_file = nlapiLoadFile(a_unmatching_File);
            var s_unmatch_content_string = Obj_file.getValue();
            s_unmatch_content = s_unmatch_content_string.toString();
            var s_unmatch_content_splitter = s_unmatch_content.toString().split('][');
            for (var u_ii = 0; u_ii < s_unmatch_content_splitter.length; u_ii++) {
                var s_unmatch_rec_arrayr = s_unmatch_content_splitter[u_ii].split('|');

                if (!isNullorEmpty(s_unmatch_rec_arrayr)) {
                    var i_bill_id = s_unmatch_rec_arrayr[0];

                    var i_ap_line_id = s_unmatch_rec_arrayr[1];
                    var i_bill_unreconcile = s_unmatch_rec_arrayr[2];
                    i_bill_unreconcile = i_bill_unreconcile.toString().replace(/minus/i, '|');
                    var i_bill_orifinal = s_unmatch_rec_arrayr[3];

                    var i_ap_line_id_1 = s_unmatch_rec_arrayr[6];
                    var i_bill_id_1 = s_unmatch_rec_arrayr[7];
                    var i_bill_unreconcile_1_ = s_unmatch_rec_arrayr[8];
                    var i_bill_orifinal_1 = s_unmatch_rec_arrayr[9];

                    i_bill_unreconcile_1_ = i_bill_unreconcile_1_.toString().replace(/minus/i, '|');
                    i_bill_orifinal_1 = i_bill_orifinal_1.toString().replace(/minus/i, '|');


                    if (u_ii == 0) {
                        var iBillID = i_bill_id.split('[');
                        i_bill_id = iBillID[1];
                    }

                    if (u_ii == (s_unmatch_content_splitter.length - 1)) {
                        var iBillID = s_unmatch_rec_arrayr[12].split(']');
                        s_unmatch_rec_arrayr[12] = iBillID[0];
                    }

                    var billArray = unmatching_bills.toString().split(',');

                    nlapiLogExecution('DEBUG', 'i_bill_id', i_bill_id)
                    nlapiLogExecution('DEBUG', 'billArray', billArray)

                    var result = billArray.indexOf(i_bill_id);

                    nlapiLogExecution('DEBUG', 'result', result)

                    if (result != -1) {

                    } else {

                        s_unmatch_content_ar += '[' + i_bill_id + '|' + s_unmatch_rec_arrayr[1] + '|' + s_unmatch_rec_arrayr[2] + '|' + s_unmatch_rec_arrayr[3] + '|' + s_unmatch_rec_arrayr[4] + '|' + s_unmatch_rec_arrayr[5] + '|' + s_unmatch_rec_arrayr[6] + '|' + s_unmatch_rec_arrayr[7] + '|' + s_unmatch_rec_arrayr[8] + '|' + s_unmatch_rec_arrayr[9] + '|' + s_unmatch_rec_arrayr[10] + '|' + s_unmatch_rec_arrayr[11] + '|' + s_unmatch_rec_arrayr[12] + ']';


                        if (i_bill_id == old_bill_id && i_ap_line_id_1 == old_po_id && !isNullorEmpty(old_bill_id) && !isNullorEmpty(old_po_id)) {

                        } else {
                            a_product_mappings_array_ar += '[' + i_bill_id + '|' + i_ap_line_id_1 + ']'
                        }
                    }

                    old_bill_id = i_bill_id;
                    old_po_id = i_ap_line_id_1;

                }
            }
        }

        nlapiLogExecution('DEBUG', 's_unmatch_content_ar', s_unmatch_content_ar);
        nlapiLogExecution('DEBUG', 'a_product_mappings_array_ar', a_product_mappings_array_ar);

        var s_file_name = 'Unmatched AP Bill and Product Order_' + partner + '.txt'
        var file_obj = nlapiCreateFile(s_file_name, 'PLAINTEXT', s_unmatch_content_ar.toString());
        file_obj.setFolder(1765674);
        var file_ID = nlapiSubmitFile(file_obj);
        nlapiLogExecution('DEBUG', 'post_restlet_function', ' file_ID -->' + file_ID);

        var mappingRecord = nlapiLoadRecord('customrecord_pr_mappings', rec_ID);

        mappingRecord.setFieldValue('custrecord_unmatching_csv_file', file_ID);
        mappingRecord.setFieldValue('custrecord_apbill_approduct_mappings', a_product_mappings_array_ar);
        mappingRecord.setFieldValue('custrecord_unmatched_bills', null);

        nlapiSubmitRecord(mappingRecord);
    }

}