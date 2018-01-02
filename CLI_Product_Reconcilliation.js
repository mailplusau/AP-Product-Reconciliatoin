/**
 * Script Name : CLI_Product_Reconcilliation
 * Date        : 1 Nov 2016
 * Author      : Shweta Chopde 
 * Description : The script is designed to apply validations on UI with drag & drop functionality for AP Product & AP Bill records
 * 
 */



function call_window(params) {
	var i_user = reconcile_params['partner'].partner;

	if (!_logValidation(i_user)) {
		i_user = '';
	}
	var reconcile_array = reconcile_params['reconcile_array'].reconcile_array;
	if (!_logValidation(reconcile_array)) {
		reconcile_array = '';
	}
	var a_linking_array = reconcile_params['a_linking_array'].a_linking_array;
	if (!_logValidation(a_linking_array)) {
		a_linking_array = '';
	}
	var a_unmatch_array_GLOBAL = reconcile_params['a_unmatch_array_GLOBAL'].a_unmatch_array_GLOBAL;
	if (!_logValidation(a_unmatch_array_GLOBAL)) {
		a_unmatch_array_GLOBAL = '';
	}
	var a_unmatch_array = reconcile_params['a_unmatch_array'].a_unmatch_array;
	if (!_logValidation(a_unmatch_array)) {
		a_unmatch_array = '';
	}
	var a_unmatch_array_beforeload = reconcile_params['a_unmatch_array_beforeload'].a_unmatch_array_beforeload;
	if (!_logValidation(a_unmatch_array_beforeload)) {
		a_unmatch_array_beforeload = '';
	}
	var d_bill_from_date = reconcile_params['d_bill_from_date'].d_bill_from_date;
	if (!_logValidation(d_bill_from_date)) {
		d_bill_from_date = '';
	}
	var d_bill_to_date = reconcile_params['d_bill_to_date'].d_bill_to_date;
	if (!_logValidation(d_bill_to_date)) {
		d_bill_to_date = '';
	}
	var d_product_from_date = reconcile_params['d_product_from_date'].d_product_from_date;
	if (!_logValidation(d_product_from_date)) {
		d_product_from_date = '';
	}
	var d_product_to_date = reconcile_params['d_product_to_date'].d_product_to_date;
	if (!_logValidation(d_product_to_date)) {
		d_product_to_date = '';
	}
	var a_cancel_array = reconcile_params['a_cancel_array'].a_cancel_array;
	if (!_logValidation(a_cancel_array)) {
		a_cancel_array = '';
	}
	var a_confirm_array = reconcile_params['a_confirm_array'].a_confirm_array;
	if (!_logValidation(a_confirm_array)) {
		a_confirm_array = '';
	}
	var a_deliver_array = reconcile_params['a_deliver_array'].a_deliver_array;
	if (!_logValidation(a_deliver_array)) {
		a_deliver_array = '';
	}
	var a_reconcile_Array_before_Load = reconcile_params['reconcile_Array_before_Load'].reconcile_Array_before_Load;
	if (!_logValidation(a_reconcile_Array_before_Load)) {
		a_reconcile_Array_before_Load = '';
	}
	// GET EDIT FUNCTIONALITY INFORMATION
	var called_type = reconcile_params['called_type'].called_type;
	if (!_logValidation(called_type)) {
		called_type = '';
	}

	//try
	{
		//	alert(' User -->'+i_user)

		var i_record_id = get_Record(i_user);
		// alert(' Record ID  -->' + i_record_id)
		var rec_Obj = '';

		if (_logValidation(i_record_id)) {
			rec_Obj = nlapiLoadRecord('customrecord_product_reconciliation_data', i_record_id);
			//	rec_Obj.setFieldValue('custrecord_prd_user',i_user); // Set Current User 
			// alert(' Record Loaded -->' + rec_Obj)

		} else {
			rec_Obj = nlapiCreateRecord('customrecord_product_reconciliation_data', {
				recordmode: 'dynamic'
			});
			// alert(' Record Created -->' + rec_Obj)
		}


		rec_Obj.setFieldValue('custrecord_prd_reconcile_array', reconcile_array); // main reconcile Array
		rec_Obj.setFieldValue('custrecord_prd_linking_array', a_linking_array); // Linking Array 		 
		rec_Obj.setFieldValue('custrecord_prd_unmatch_array', a_unmatch_array); // Unmatch Array 
		rec_Obj.setFieldValue('custrecord_prd_unmatch_array_before_load', a_unmatch_array_beforeload); // Unmatch Array BeforeLoad 
		rec_Obj.setFieldValue('custrecord_prd_bill_to_date', d_bill_to_date); // To  Date Bill 
		rec_Obj.setFieldValue('custrecord_prd_bill_from_date', d_bill_from_date); // From  Date Bill 		 
		rec_Obj.setFieldValue('custrecord_prd_product_from_date', d_product_from_date); // From  Date AP Order 
		rec_Obj.setFieldValue('custrecord_prd_product_to_date', d_product_to_date); // To Date AP Order 		
		rec_Obj.setFieldValue('custrecord_prd_unmatched_array_global', a_unmatch_array_GLOBAL); // Unmatch Global 
		rec_Obj.setFieldValue('custrecord_prd_user', i_user); // Set Current User
		rec_Obj.setFieldValue('custrecord_prd_cancel', a_cancel_array); // Set Current User 
		rec_Obj.setFieldValue('custrecord_prd_confirm', a_confirm_array); // Set Current User 
		rec_Obj.setFieldValue('custrecord_prd_deliver', a_deliver_array); // Set Current User 
		rec_Obj.setFieldValue('custrecord_reconcile_array_bef_load', a_reconcile_Array_before_Load); // Set Current User 
		var flagCalled = 0;
		// SET EDIT FUNCTIONALITY INFORMATION

		// alert(' Called Type  -->' + called_type)

		if (called_type == 2) // Edit
		{
			var custrecord_customer_id = reconcile_params['custrecord_customer_id'].custrecord_customer_id;
			if (!_logValidation(custrecord_customer_id)) {
				custrecord_customer_id = '';
			}
			var custrecord_edit_product_order_id = reconcile_params['custrecord_edit_product_order_id'].custrecord_edit_product_order_id;
			if (!_logValidation(custrecord_edit_product_order_id)) {
				custrecord_edit_product_order_id = '';
			}
			rec_Obj.setFieldValue('custrecord_customer_id', custrecord_customer_id); // Set Current User 
			rec_Obj.setFieldValue('custrecord_edit_product_order_id', custrecord_edit_product_order_id); // Set Current User 
			//rec_Obj.setFieldValue('custrecord_call_type',2); // Set Current User 
			flagCalled = 1;
		}
		if (called_type == 1) // Dispute 
		{
			var ap_stock_receipt_id = reconcile_params['ap_stock_receipt_id'].ap_stock_receipt_id;
			if (!_logValidation(ap_stock_receipt_id)) {
				ap_stock_receipt_id = '';
			}
			var ap_type = reconcile_params['ap_type'].ap_type;
			if (!_logValidation(ap_type)) {
				ap_type = '';
			}
			var upload_file = reconcile_params['upload_file'].upload_file;
			if (!_logValidation(upload_file)) {
				upload_file = '';
			}
			/*var upload_file_id =reconcile_params['upload_file_id'].upload_file_id;
			if(!_logValidation(upload_file_id))
		    {
				upload_file_id  = '';
		    }*/
			var file_type = reconcile_params['file_type'].file_type;
			if (!_logValidation(file_type)) {
				file_type = '';
			}

			rec_Obj.setFieldValue('custrecord_dispute_ap_bill_id', ap_stock_receipt_id); // Set Current User 
			rec_Obj.setFieldValue('custrecord_dispute_type', ap_type); // Set Current User 
			rec_Obj.setFieldValue('custrecord_dispute_file_upload', upload_file); // Set Current User 
			//rec_Obj.setFieldValue('custrecord_dispute_upload_file_id',upload_file_id); // Set Current User 
			rec_Obj.setFieldValue('custrecord_dispute_file_type', file_type); // Set Current User 
			//rec_Obj.setFieldValue('custrecord_call_type',1); // Set Current User 
			flagCalled = 1;

		}
		if (called_type == 3) // Add New Order 
		{
			var prod_recon = reconcile_params['prod_recon'].prod_recon;
			if (!_logValidation(prod_recon)) {
				prod_recon = '';
			}
			//var product_order_id =reconcile_params['product_order_id'].ap_type;
			//if(!_logValidation(product_order_id))
			// {
			//	product_order_id  = '';
			// }
			////var customer_id =reconcile_params['customer_id'].customer_id;
			//if(!_logValidation(customer_id))
			// {
			//	customer_id  = '';
			// }
			rec_Obj.setFieldValue('custrecord_add_new_order_product_recon', prod_recon); // Set Current User 
			//rec_Obj.setFieldValue('custrecord_add_new_order_product_orderid',product_order_id); // Set Current User 
			// rec_Obj.setFieldValue('custrecord_add_new_order_customer_id',customer_id); // Set Current User 
			// rec_Obj.setFieldValue('custrecord_call_type',3); // Set Current User 
			flagCalled = 1;
		}

		// alert('flagCalled -->'+flagCalled)

		if (flagCalled == 1) {

			var i_submit_product_data = nlapiSubmitRecord(rec_Obj, true, true);
			//	 alert(' Submit Data 1  -->'+i_submit_product_data)

			var url = nlapiResolveURL('SUITELET', 'customscript_sut_product_rec_functional', 'customdeploy1');
			url = url + '&reconcile_array_rec_id=' + i_submit_product_data + '&called_type=' + called_type;
			window.open(url);
			window.close();
		} else {
			// alert('else Flag -->'+flagCalled)


			try {
				var i_submit_product_data = nlapiSubmitRecord(rec_Obj, true, true);
				// alert(' Submit Data 2  -->'+i_submit_product_data)

			} catch (e) {
				if (e instanceof nlobjError) {
					alert('System error: ' + e.getDetails());
				} else {
					alert('Unexpected error: ' + e.toString());
				}
			}

			var url = nlapiResolveURL('SUITELET', 'customscript_sut_product_rec_functional', 'customdeploy1');
			url = url + '&reconcile_array_rec_id=' + i_submit_product_data;
			window.open(url);
			window.close();
		}
	}
	//catch(err)
	{
		//	alert('error Occured -->'+err);
	}
}

function _logValidation(value) {
	if (value != null && value != 'undefined' && value != undefined && value != '' && value != 'NaN' && value != ' ') {
		return true;
	} else {
		return false;
	}
}

function get_Record(i_user) {
	var columns = new Array();
	var a_filters = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	a_filters[0] = new nlobjSearchFilter('custrecord_prd_user', null, 'is', i_user);
	var i_internal_id = '';
	var a_search_results = nlapiSearchRecord('customrecord_product_reconciliation_data', null, a_filters, columns);
	if (_logValidation(a_search_results)) {
		i_internal_id = a_search_results[0].getValue('internalid');
	}
	return i_internal_id;
}