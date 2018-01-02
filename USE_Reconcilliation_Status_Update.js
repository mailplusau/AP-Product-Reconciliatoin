/**
 * Script Name : USE_Reconcilliation_Status_Update
 * Date        : 7 Nov 2016
 * Author      : Shweta Chopde 
 * Description : The script is designed to update the status of Product Order / AP Bills
 * 
 */
function after_submit_AP(type) {
	if (type != 'delete') {
		var flag_h = 0;
		var i_context = nlapiGetContext();
		var i_recordID = nlapiGetRecordId();
		var i_current_user = nlapiGetUser();
		var s_record_type = nlapiGetRecordType();
		var s_execution_type = i_context.getExecutionContext();
		var i_product_mappings_ID = '';

		nlapiLogExecution('DEBUG', 'after_submit_AP', ' Execution Type -->' + s_execution_type);

		nlapiLogExecution('DEBUG', 'after_submit_AP', 'Record ID -->' + i_recordID + '-------' + 'Record Type -->' + s_record_type);
		// if(s_execution_type == 'userinterface')
		if (s_execution_type == 'suitelet') {

			if (_logValidation(i_recordID) && _logValidation(s_record_type)) {
				var o_recordOBJ = nlapiLoadRecord(s_record_type, i_recordID, {
					recordmode: 'dynamic'
				});

				if (_logValidation(o_recordOBJ)) {
					var bill_to_Update = new Array();
					var a_ap_order_array = new Array();
					var g_record_to_Update = '';

					var i_AP_Bill_ID = o_recordOBJ.getFieldValue('custrecord_ap_stock_line_stock_receipt');
					if (_logValidation(i_AP_Bill_ID)) {
						bill_to_Update[bill_to_Update.length] = i_AP_Bill_ID;
						g_record_to_Update = i_AP_Bill_ID;

						i_current_user = o_recordOBJ.getFieldValue('custrecord_ap_bill_franchisee');
						nlapiLogExecution('DEBUG', 'after_submit_AP', 'AP Bill i_current_user -->' + i_current_user);

					}

					var i_AP_Product_ID = o_recordOBJ.getFieldValue('custrecord_ap_product_order');


					if (_logValidation(i_AP_Product_ID)) {
						a_ap_order_array[a_ap_order_array.length] = i_AP_Product_ID;
						g_record_to_Update = i_AP_Product_ID;
						i_current_user = o_recordOBJ.getFieldValue('custrecord_ap_product_order_franchisee');
						nlapiLogExecution('DEBUG', 'after_submit_AP', 'AP Product i_current_user -->' + i_current_user);

					}

					// ============== PRODUCT RECONCILLIATION PAGE PARAMS ===============
					var a_product_reconcilliation_array = get_product_reconcilliation_page_parameters();
					var i_unauthorized_item = a_product_reconcilliation_array[0].unauthorized_item;
					nlapiLogExecution('DEBUG', 'i_unauthorized_item ', 'i_unauthorized_item -->' + i_unauthorized_item);


					var item_type = o_recordOBJ.getFieldValue('custrecord_ap_stock_line_item');
					nlapiLogExecution('DEBUG', 'item_type  ', 'item_type -->' + item_type);


					var columns = new Array();
					var a_filters = new Array();
					columns[0] = new nlobjSearchColumn('internalid');
					columns[1] = new nlobjSearchColumn('custrecord_apbill_approduct_mappings');
					a_filters[0] = new nlobjSearchFilter('custrecord_partner_user', null, 'is', i_current_user);
					var a_search_results = nlapiSearchRecord('customrecord_pr_mappings', null, a_filters, columns);

					if (_logValidation(a_search_results)) {
						var i_pr_mappings_ID = a_search_results[0].getValue('internalid');

						var a_product_mappings_array = a_search_results[0].getValue('custrecord_apbill_approduct_mappings');
						i_product_mappings_ID = i_pr_mappings_ID;
					}

					a_linking_array = a_product_mappings_array;
					var a_linking_array_splitter = '';
					if (_logValidation(a_linking_array)) {
						a_linking_array_splitter = a_linking_array.toString().split('][');
					}

					var g_order_to_Update = '';

					a_bill_array = new Array();
					nlapiLogExecution('DEBUG', 'after_submit_AP', 'a_linking_array_splitter  -->' + a_linking_array_splitter);

					for (var kk = 0; kk < a_linking_array_splitter.length; kk++) {

						if (_logValidation(i_AP_Bill_ID)) {
							a_ap_order_array.push(_getRelated_Order_Array(bill_to_Update, a_linking_array, g_record_to_Update))
							bill_to_Update.push(_get_Related_Bill_Array(a_ap_order_array, a_linking_array, g_record_to_Update))
						}

						if (_logValidation(i_AP_Product_ID)) {
							bill_to_Update.push(_get_Related_Bill_Array(a_ap_order_array, a_linking_array, g_record_to_Update))
							a_ap_order_array.push(_getRelated_Order_Array(bill_to_Update, a_linking_array, g_record_to_Update))
						}
					}


					bill_to_Update = remove_duplicatesstring(bill_to_Update);
					a_ap_order_array = remove_duplicatesstring(a_ap_order_array);
					nlapiLogExecution('DEBUG', 'post_restlet_function', ' bill_to_Update -->' + bill_to_Update);
					nlapiLogExecution('DEBUG', 'post_restlet_function', ' a_ap_order_array -->' + a_ap_order_array);

					var a_mapping_array_1 = bill_to_Update;
					var a_mapping_array_2 = a_ap_order_array;
					nlapiLogExecution('DEBUG', 'post_restlet_function', ' a_mapping_array_1 -->' + a_mapping_array_1.length);
					nlapiLogExecution('DEBUG', 'post_restlet_function', ' a_mapping_array_2 -->' + a_mapping_array_2.length);
					var a_mapping_array_1_1 = new Array();
					var a_mapping_array_2_2 = new Array();

					var a_total_mappings_array = new Array();


					a_mapping_array_1 = remove_duplicates(a_mapping_array_1);
					a_mapping_array_2 = remove_duplicates(a_mapping_array_2);
					a_total_mappings_array = remove_duplicates(a_total_mappings_array);

					nlapiLogExecution('DEBUG', 'post_restlet_function', ' Mapping Array 1 -->' + a_mapping_array_1);
					nlapiLogExecution('DEBUG', 'post_restlet_function', 'Mapping Array 2  -->' + a_mapping_array_2);

					//	 a_mapping_array_1_1 = remove_duplicates(a_mapping_array_1_1);
					//	 a_mapping_array_2_2 = remove_duplicates(a_mapping_array_2_2);

					//	 nlapiLogExecution('DEBUG', 'post_restlet_function', ' Mapping Array 1 1 -->'+a_mapping_array_1_1);
					//	 nlapiLogExecution('DEBUG', 'post_restlet_function', 'Mapping Array 2 2  -->'+a_mapping_array_2_2);
					nlapiLogExecution('DEBUG', 'post_restlet_function', ' Total Mappings Array -->' + a_total_mappings_array);

					var a_mappings_status_1 = false;
					var a_mappings_status_2 = false;

					if (_logValidation(a_mapping_array_1)) {
						var a_mappings_status = get_AP_line_details_GROUP(a_mapping_array_1, '', g_record_to_Update)
						a_mappings_status_1 = a_mappings_status;
						nlapiLogExecution('DEBUG', 'after_submit_AP', ' Mapping Array Status 1 -->' + a_mappings_status);
					}
					if (_logValidation(a_mapping_array_2)) {
						var a_mappings_status = get_AP_line_details_GROUP('', a_mapping_array_2, g_record_to_Update)
						a_mappings_status_2 = a_mappings_status;
						nlapiLogExecution('DEBUG', 'after_submit_AP', ' Mapping Array Status 2 -->' + a_mappings_status);
					}

					var flag_B = 0;

					if (_logValidation(i_AP_Bill_ID)) {
						var o_AP_Bill_OBJ = nlapiLoadRecord('customrecord_mp_ap_stock_receipt', i_AP_Bill_ID, {
							recordmode: 'dynamic'
						});

						if (_logValidation(o_AP_Bill_OBJ)) {
							var is_fully_reconciled = get_AP_line_details(i_AP_Bill_ID, '')
							nlapiLogExecution('DEBUG', 'after_submit_AP', 'Is Fully Reconciled ? -->' + is_fully_reconciled);

							if (is_fully_reconciled == true) {
								nlapiLogExecution('DEBUG', 'after_submit_AP', 'Within Reconcile Block Bill .....');

								o_AP_Bill_OBJ.setFieldValue('custrecord_bill_mapping_reconcilliation', 1);

								var bill_idddd = nlapiSubmitField('customrecord_mp_ap_stock_receipt', i_AP_Bill_ID, 'custrecord_bill_mapping_reconcilliation', 1);
								nlapiLogExecution('DEBUG', 'bill_idddd ', 'bill_idddd  -->' + bill_idddd);

							}

							nlapiLogExecution('DEBUG', 'after_submit_AP', ' IF is_fully_reconciled -->' + is_fully_reconciled);

							nlapiLogExecution('DEBUG', 'after_submit_AP', ' IF a_mappings_status -->' + a_mappings_status);


							if (is_fully_reconciled == true) {

								{

									nlapiLogExecution('DEBUG', 'after_submit_AP', ' else a_mappings_status_1_q -->' + a_mappings_status);

									flag_B = 1;

								}
								nlapiLogExecution('DEBUG', 'after_submit_AP', ' BILL OUT flag_B -->' + flag_B);

								if (_logValidation(a_mapping_array_2) && _logValidation(a_mapping_array_1)) {
									if (a_mappings_status_2 == true && a_mappings_status_1 == true) {
										nlapiLogExecution('DEBUG', 'after_submit_AP', ' BILL IN flag_B ->' + flag_B);
										o_AP_Bill_OBJ.setFieldValue('custrecord_ap_stock_recon_status', 1);

										if (item_type == i_unauthorized_item) {
											nlapiLogExecution('DEBUG', 'i_unauthorized_item', ' i_unauthorized_item->' + i_unauthorized_item);
											update_fully_reconciled_BILL(a_mapping_array_1);
											update_fully_reconciled_ORDER(a_mapping_array_2, g_record_to_Update);
										} else {
											nlapiLogExecution('DEBUG', 'Normal item ', ' Normal item->' + item_type);
											update_fully_reconciled_BILL(a_mapping_array_1, g_record_to_Update);
											update_fully_reconciled_ORDER(a_mapping_array_2, g_record_to_Update);
										}

									}
								} else if (_logValidation(a_mapping_array_2) && !_logValidation(a_mapping_array_1)) {
									if (a_mappings_status_2 == true) {
										nlapiLogExecution('DEBUG', 'after_submit_AP', '  BILL IN flag_B -->' + flag_B);
										o_AP_Bill_OBJ.setFieldValue('custrecord_ap_stock_recon_status', 1);
										//				    				update_fully_reconciled_BILL(a_mapping_array_1);
										update_fully_reconciled_ORDER(a_mapping_array_2, g_record_to_Update);
									}
								} else if (!_logValidation(a_mapping_array_2) && _logValidation(a_mapping_array_1)) {
									if (a_mappings_status_1 == true) {
										nlapiLogExecution('DEBUG', 'after_submit_AP', ' BILL IN flag_B --->' + flag_B);
										o_AP_Bill_OBJ.setFieldValue('custrecord_ap_stock_recon_status', 1);
										update_fully_reconciled_BILL(a_mapping_array_1, g_record_to_Update);
										//	update_fully_reconciled_ORDER(a_mapping_array_2);
									}
								} else {
									o_AP_Bill_OBJ.setFieldValue('custrecord_ap_stock_recon_status', 1);
									var i_AP_Bill_submit_ID = nlapiSubmitRecord(o_AP_Bill_OBJ, true, true);
									nlapiLogExecution('DEBUG', 'after_submit_AP', 'AP Bill Submit ID # -->' + i_AP_Bill_submit_ID);
								}
							}

						}
					} //AP Bill	

					var flag_P = 0;

					if (_logValidation(i_AP_Product_ID)) {
						var o_AP_Product_OBJ = nlapiLoadRecord('customrecord_mp_ap_product_order', i_AP_Product_ID, {
							recordmode: 'dynamic'
						});

						if (_logValidation(o_AP_Product_OBJ)) {
							var is_fully_reconciled = get_AP_line_details('', i_AP_Product_ID)
							nlapiLogExecution('DEBUG', 'after_submit_AP', 'i_AP_Product_ID BLOCK Is Fully Reconciled ? -->' + is_fully_reconciled);

							if (is_fully_reconciled == true) {
								nlapiLogExecution('DEBUG', 'after_submit_AP', 'Within Reconcile Block Order .....');

								o_AP_Product_OBJ.setFieldValue('custrecord_mapping_reconcilliation_statu', 1);

								nlapiSubmitField('customrecord_mp_ap_product_order', i_AP_Product_ID, 'custrecord_mapping_reconcilliation_statu', 1);

							}
							nlapiLogExecution('DEBUG', 'after_submit_AP', 'PRODUCT OUT Is Fully Reconciled ? -->' + is_fully_reconciled);

							nlapiLogExecution('DEBUG', 'after_submit_AP', ' PRODUCT OUT a_mappings_status -->' + a_mappings_status_2);

							if (is_fully_reconciled == true) {
								flag_P = 1;
								nlapiLogExecution('DEBUG', 'after_submit_AP', ' PRODUCT OUT flag_P -->' + flag_P);

								if (_logValidation(a_mapping_array_1) && _logValidation(a_mapping_array_2)) {
									if (a_mappings_status_1 == true && a_mappings_status_2 == true) {
										nlapiLogExecution('DEBUG', 'after_submit_AP', ' both true PRODUCT IN flag_P -->' + flag_P);
										o_AP_Product_OBJ.setFieldValue('custrecord_ap_order_recon_status', 1);
										update_fully_reconciled_BILL(a_mapping_array_1);
										update_fully_reconciled_ORDER(a_mapping_array_2);
									}
								} else if (_logValidation(a_mapping_array_1) && !_logValidation(a_mapping_array_2)) {
									if (a_mappings_status_1 == true) {
										nlapiLogExecution('DEBUG', 'after_submit_AP', ' status 1 is true PRODUCT IN flag_P -->' + flag_P);
										o_AP_Product_OBJ.setFieldValue('custrecord_ap_order_recon_status', 1);
										update_fully_reconciled_BILL(a_mapping_array_1);
									}
								} else if (!_logValidation(a_mapping_array_1) && _logValidation(a_mapping_array_2)) {
									if (a_mappings_status_2 == true) {
										nlapiLogExecution('DEBUG', 'after_submit_AP', ' status 2 true PRODUCT IN flag_P -->' + flag_P);
										o_AP_Product_OBJ.setFieldValue('custrecord_ap_order_recon_status', 1);
										update_fully_reconciled_ORDER(a_mapping_array_2, g_record_to_Update);
									}
								} else {
									o_AP_Product_OBJ.setFieldValue('custrecord_ap_order_recon_status', 1);
									var i_AP_Product_submit_ID = nlapiSubmitRecord(o_AP_Product_OBJ, true, true);
									nlapiLogExecution('DEBUG', 'after_submit_AP', 'AP Product Submit ID # -->' + i_AP_Product_submit_ID);
								}
								//update_fully_reconciled_ORDER(a_mapping_array_2);
							}

						}
					} //AP Product
				} //Record OBJ   
			} //Record ID & Record Type   
		} //Execution Type
	}

} //After Submit
/** 
 * @param value
 * @returns
 */



function _get_Related_Bill_Array(a_ap_order_array, a_linking_array, g_bill_to_Update) {
	//nlapiLogExecution('DEBUG', '_get_Related_Bill_Array START ', ' ORDERS-->'+a_ap_order_array);

	var a_linking_array_splitter = a_linking_array.split('][');
	var a_order_array = new Array();

	if (_logValidation(a_ap_order_array)) {
		a_ap_order_array = a_ap_order_array.toString().split(',');
		a_ap_order_array = remove_duplicatesarray(a_ap_order_array);
		nlapiLogExecution('DEBUG', '_get_Related_Bill_Array START ', ' ORDERS-->' + a_ap_order_array.length);
		for (var kk = 0; kk < a_ap_order_array.length; kk++) {
			for (var jk = 0; jk < a_linking_array_splitter.length; jk++) {
				var a_split_rec_array_temp = a_linking_array_splitter[jk].split('|');
				var i_temp_bill = a_split_rec_array_temp[0];
				var i_temp_order = a_split_rec_array_temp[1];

				i_temp_bill = i_temp_bill.replace(/[^0-9]/g, "");
				i_temp_order = i_temp_order.replace(/[^0-9]/g, "");

				if (i_temp_order == a_ap_order_array[kk]) {
					if (a_order_array.indexOf(i_temp_bill) == -1)
						a_order_array.push(i_temp_bill)
				}
			}
		}
	}

	a_order_array = remove_duplicatesarray(a_order_array);
	//nlapiLogExecution('DEBUG', '_get_Related_Bill_Array END  ', ' Related Bill-->'+a_order_array);
	return a_order_array;
} // end of  function agetRelated_Order_Array(bill_to_Update,a_linking_array)


function _getRelated_Order_Array(bill_to_Update, a_linking_array, g_order_to_Update) {
	//nlapiLogExecution('DEBUG', '_getRelated_Order_Array START ', ' BILLS-->'+bill_to_Update);
	var a_linking_array_splitter = a_linking_array.split('][');

	var a_order_array = new Array();
	if (_logValidation(bill_to_Update)) {
		bill_to_Update = bill_to_Update.toString().split(',');
		bill_to_Update = remove_duplicatesarray(bill_to_Update);
		for (var kk = 0; kk < bill_to_Update.length; kk++) {
			for (var jk = 0; jk < a_linking_array_splitter.length; jk++) {
				var a_split_rec_array_temp = a_linking_array_splitter[jk].split('|');
				var i_temp_bill = a_split_rec_array_temp[0];
				var i_temp_order = a_split_rec_array_temp[1];

				i_temp_bill = i_temp_bill.replace(/[^0-9]/g, "");
				i_temp_order = i_temp_order.replace(/[^0-9]/g, "");

				if (i_temp_bill == bill_to_Update[kk]) {
					if (a_order_array.indexOf(i_temp_order) == -1)
						a_order_array.push(i_temp_order)
				}
			}
		}
	}
	a_order_array = remove_duplicatesarray(a_order_array);
	//nlapiLogExecution('DEBUG', '_getRelated_Order_Array END  ', ' Related ORDER-->'+a_order_array);
	return a_order_array;
} // end of  function agetRelated_Order_Array(bill_to_Update,a_linking_array)


function _logValidation(value) {
	if (value != null && value != undefined && value != '' && value != 'NaN' && value != ' ') {
		return true;
	} else {
		return false;
	}
}

function remove_duplicatesstring(arr) {
	arr = arr.toString().split(',');
	var seen = {};
	var ret_arr = [];
	for (var i = 0; i < arr.length; i++) {
		if (!(arr[i] in seen)) {
			ret_arr.push(arr[i]);
			seen[arr[i]] = true;
		}
	}
	return ret_arr;
}

function remove_duplicatesarray(arr) {
	var seen = {};
	var ret_arr = [];
	for (var i = 0; i < arr.length; i++) {
		if (!(arr[i] in seen)) {
			ret_arr.push(arr[i]);
			seen[arr[i]] = true;
		}
	}
	return ret_arr;
}


function _logValidation(value) {
	if (value != null && value != undefined && value != '' && value != 'NaN' && value != ' ') {
		return true;
	} else {
		return false;
	}
}

function remove_duplicates(arr) {
	var seen = {};
	var ret_arr = [];
	for (var i = 0; i < arr.length; i++) {
		if (!(arr[i] in seen)) {
			ret_arr.push(arr[i]);
			seen[arr[i]] = true;
		}
	}
	return ret_arr;
}

function get_AP_line_details(i_AP_Bill_ID, i_AP_Product_ID) {
	var a_return_data = false;

	var filter = new Array();
	var status_array = new Array();

	if (_logValidation(i_AP_Bill_ID)) {
		filter[0] = new nlobjSearchFilter('custrecord_ap_stock_line_stock_receipt', null, 'is', i_AP_Bill_ID);
	}
	if (_logValidation(i_AP_Product_ID)) {
		filter[0] = new nlobjSearchFilter('custrecord_ap_product_order', null, 'is', i_AP_Product_ID);
	}
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_ap_line_recon_status');

	var a_search_results = nlapiSearchRecord('customrecord_ap_stock_line_item', null, filter, columns);

	if (_logValidation(a_search_results)) {
		nlapiLogExecution('DEBUG', 'schedulerFunction', ' No. of AP Lines found --->' + a_search_results.length);

		for (var cn = 0; cn < a_search_results.length; cn++) {
			var i_bill_ID = a_search_results[cn].getValue('internalid');

			var i_status = a_search_results[cn].getValue('custrecord_ap_line_recon_status');
			nlapiLogExecution('DEBUG', 'i_status ', ' i_status ' + i_status);

			if (i_status == 1 || i_status == 6) {
				status_array.push(i_status);
			}
		}
		if (_logValidation(status_array)) {
			if (status_array.length == a_search_results.length) {
				a_return_data = true;
			}
		}
	}
	return a_return_data;
} //AP Line Item Details
function product_reconcilliation_mappings() {
	var i_value = '';

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_apbill_approduct_mappings');

	var a_search_results = nlapiSearchRecord('customrecord_pr_mappings', null, null, columns);

	if (_logValidation(a_search_results)) {
		var i_pr_mappings_ID = a_search_results[0].getValue('internalid');

		var i_pr_mappings_array = a_search_results[0].getValue('custrecord_apbill_approduct_mappings');

		i_value = i_pr_mappings_array;
	}
	return i_value;
} //Product Reconcilliation Mappings


function get_AP_line_details_GROUP(i_AP_Bill_ID, i_AP_Product_ID, g_record_to_Update) {
	var a_return_data = false;

	var filter = new Array();
	var status_array = new Array();

	if (_logValidation(i_AP_Bill_ID)) {
		filter[0] = new nlobjSearchFilter('custrecord_ap_stock_line_stock_receipt', null, 'anyof', i_AP_Bill_ID);
		//  filter[1] = new nlobjSearchFilter('internalid', null, 'noneof', g_record_to_Update);

	}
	if (_logValidation(i_AP_Product_ID)) {
		filter[0] = new nlobjSearchFilter('custrecord_ap_product_order', null, 'anyof', i_AP_Product_ID);
		//   filter[1] = new nlobjSearchFilter('internalid', null, 'noneof', g_record_to_Update);
	}
	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_ap_line_recon_status');

	var a_search_results = nlapiSearchRecord('customrecord_ap_stock_line_item', null, filter, columns);

	if (_logValidation(a_search_results)) {
		nlapiLogExecution('DEBUG', 'get_AP_line_details_GROUP', ' No. of AP Lines found 1 --->' + a_search_results.length);

		for (var cn = 0; cn < a_search_results.length; cn++) {
			var i_bill_ID = a_search_results[cn].getValue('internalid');
			// nlapiLogExecution('DEBUG', 'get_AP_line_details_GROUP',' Bill ID --->' +i_bill_ID);

			var i_status = a_search_results[cn].getValue('custrecord_ap_line_recon_status');
			// nlapiLogExecution('DEBUG', 'get_AP_line_details_GROUP',' Status --->' +i_status);

			if (i_status == 1 || i_status == 6) {
				status_array.push(i_status);
			}
		}

		//  nlapiLogExecution('DEBUG', 'get_AP_line_details_GROUP',' Status Array --->' +status_array);

		if (_logValidation(status_array)) {
			nlapiLogExecution('DEBUG', 'get_AP_line_details_GROUP', ' Status Array Length  i_AP_Bill_ID --->' + status_array.length + 'g_record_to_Update -->' + g_record_to_Update);

			if (status_array.length == a_search_results.length) {
				a_return_data = true;
			}

		}
	}
	return a_return_data;
} //AP Line Item Details

function update_fully_reconciled_BILL(a_bill_array, g_record_to_Update) {
	nlapiLogExecution('DEBUG', 'update_fully_reconciled_ORDER', ' Bill Array -->' + a_bill_array);

	if (_logValidation(a_bill_array)) {
		for (var b_q = 0; b_q < a_bill_array.length; b_q++) {
			nlapiLogExecution('DEBUG', 'update_fully_reconciled_ORDER', ' Bill Array[' + b_q + ']-->' + a_bill_array[b_q]);

			if (_logValidation(a_bill_array[b_q]) && a_bill_array[b_q] != g_record_to_Update) {
				var o_AP_Bill_OBJ = nlapiLoadRecord('customrecord_mp_ap_stock_receipt', a_bill_array[b_q]);

				if (_logValidation(o_AP_Bill_OBJ)) {
					o_AP_Bill_OBJ.setFieldValue('custrecord_ap_stock_recon_status', 1);

					var i_AP_Bill_submit_ID = nlapiSubmitRecord(o_AP_Bill_OBJ, true, true);
					nlapiLogExecution('DEBUG', 'update_fully_reconciled_BILL', 'AP Bill Submit ID # -->' + i_AP_Bill_submit_ID);
				}
			} //AP Bill		

		}

	} //Bill Array
}

function update_fully_reconciled_ORDER(a_product_array, g_record_to_Update) {
	if (_logValidation(a_product_array)) {
		for (var p_q = 0; p_q < a_product_array.length; p_q++) {
			nlapiLogExecution('DEBUG', 'update_fully_reconciled_ORDER', ' Product Array[' + p_q + '] -->' + a_product_array[p_q]);

			if (_logValidation(a_product_array[p_q]) && a_product_array[p_q] != g_record_to_Update) {
				var o_AP_Product_OBJ = nlapiLoadRecord('customrecord_mp_ap_product_order', a_product_array[p_q]);

				if (_logValidation(o_AP_Product_OBJ)) {
					o_AP_Product_OBJ.setFieldValue('custrecord_ap_order_recon_status', 1);

					var i_AP_Product_submit_ID = nlapiSubmitRecord(o_AP_Product_OBJ, true, true);
					nlapiLogExecution('DEBUG', 'update_fully_reconciled_ORDER', 'AP Product Submit ID # -->' + i_AP_Product_submit_ID);
				}
			} //AP Product	
		}

	}
}

function get_fully_reconciled_mappings(a_total_mappings_array) {
	var filter = new Array();
	var a_data_array = new Array();

	if (_logValidation(a_total_mappings_array)) {
		nlapiLogExecution('DEBUG', 'update_fully_reconciled_ORDER', 'a_total_mappings_array #### -->' + a_total_mappings_array);
		nlapiLogExecution('DEBUG', 'update_fully_reconciled_ORDER', 'a_total_mappings_array Length #### -->' + a_total_mappings_array.length);

		filter[0] = new nlobjSearchFilter('custrecord_mapping_reconcilliation_statu', null, 'is', 1);
		filter[1] = new nlobjSearchFilter('internalid', null, 'anyof', a_total_mappings_array);

		var columns = new Array();
		columns[0] = new nlobjSearchColumn('internalid');

		var a_search_results = nlapiSearchRecord('customrecord_mp_ap_product_order', null, filter, columns);

		if (_logValidation(a_search_results)) {
			for (var t = 0; t < a_search_results.length; t++) {
				var i_ID = a_search_results[t].getValue('internalid');
				nlapiLogExecution('DEBUG', 'update_fully_reconciled_ORDER', '##### ID #### -->' + i_ID);
				a_data_array.push(i_ID);
			}
		}
	}
	nlapiLogExecution('DEBUG', 'update_fully_reconciled_ORDER', '##### a_data_array #### -->' + a_data_array);
	return a_data_array;
}



function get_product_reconcilliation_page_parameters() {
	var a_data_array = new Array();

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('custrecord_item_unauthorized');
	var a_search_results = nlapiSearchRecord('customrecord_product_reconcilliation_pag', null, null, columns);

	if (_logValidation(a_search_results)) {

		var i_unauthorized_item = a_search_results[0].getValue('custrecord_item_unauthorized');

		a_data_array[0] = {
			'unauthorized_item': i_unauthorized_item
		};

	} //Search Results
	return a_data_array;
} //Product Reconcilliation Page Parameters



/* if(_logValidation(a_linking_array))
{		  
     var a_LINK_array_values = a_linking_array.split('][');
     for(i_value = 0;i_value<a_LINK_array_values.length;i_value++)
	  {
	    
   	var g_bill_to_Update     = a_split_rec_array[0];
		var g_order_to_Update = a_split_rec_array[1];
		
		g_bill_to_Update = g_bill_to_Update.replace(/[^0-9]/g, "");	 
		g_order_to_Update = g_order_to_Update.replace(/[^0-9]/g, "");
	 
	    if(g_bill_to_Update == i_AP_Bill_ID)
	    {
			order_to_Update[order_to_Update.length]     = g_order_to_Update;
	    }	
	  
	    if(g_order_to_Update == i_AP_Product_ID)
	    {
	    	bill_to_Update[bill_to_Update.length]     = g_bill_to_Update;
	    }
	  }
}			      
*/