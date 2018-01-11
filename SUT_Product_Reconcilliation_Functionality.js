/**
 * Script Name : SUT_Product_Reconcilliation_Functionality
 * Date        : 1 Nov 2016
 * Author      : Shweta Chopde 
 * Description : The script is designed to develop a UI with drag & drop functionality for AP Product & AP Bill records
 * 
 */

function suiteletFunction(request, response) {
	try {
		var i_reconcile_Data_Parameter = request.getParameter('reconcile_array_rec_id');
		nlapiLogExecution('DEBUG', 'post_restlet_function', 'i_reconcile_Data_Parameter -->' + i_reconcile_Data_Parameter);

		// SET EDIT FUNCTIONALITY INFORMATION
		var call_type = request.getParameter('called_type'); // Set Current User
		nlapiLogExecution('DEBUG', 'submitted_id ap order ', 'call_type -->' + call_type);


		var contextObj = nlapiGetContext();
		var beginUsage = contextObj.getRemainingUsage(); // Start usage 
		nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Start usage' + beginUsage);


		if (_logValidation(i_reconcile_Data_Parameter)) {
			var Rec_Obj = nlapiLoadRecord('customrecord_product_reconciliation_data', i_reconcile_Data_Parameter);
			var d_ap_bill_from_date = Rec_Obj.getFieldValue('custrecord_prd_bill_from_date');
			nlapiLogExecution('DEBUG', 'post_restlet_function', 'AP Bill From Date -->' + d_ap_bill_from_date);

			var d_ap_bill_to_date = Rec_Obj.getFieldValue('custrecord_prd_bill_to_date');
			nlapiLogExecution('DEBUG', 'post_restlet_function', 'AP Bill To Date -->' + d_ap_bill_to_date);

			var d_ap_product_from_date = Rec_Obj.getFieldValue('custrecord_prd_product_from_date');
			nlapiLogExecution('DEBUG', 'post_restlet_function', 'AP Product From Date -->' + d_ap_product_from_date);

			var d_ap_product_to_date = Rec_Obj.getFieldValue('custrecord_prd_product_to_date');
			nlapiLogExecution('DEBUG', 'post_restlet_function', 'AP Product To Date -->' + d_ap_product_to_date);

			var a_reconcile_array = Rec_Obj.getFieldValue('custrecord_prd_reconcile_array');
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' Reconcile Array -->' + a_reconcile_array);

			var a_linking_array = Rec_Obj.getFieldValue('custrecord_prd_linking_array');
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' Linking Array -->' + a_linking_array);

			var a_unmatch_array_original = Rec_Obj.getFieldValue('custrecord_prd_unmatched_array_global');
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' a_unmatch_array_original-->' + a_unmatch_array_original);

			var a_cancel_params = Rec_Obj.getFieldValue('custrecord_prd_cancel');
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' Cancel Parameters -->' + a_cancel_params);

			var a_deliver_params = Rec_Obj.getFieldValue('custrecord_prd_deliver');
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' Deliver Parameters -->' + a_deliver_params);

			var a_confirm_params = Rec_Obj.getFieldValue('custrecord_prd_confirm');
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' Confirm Parameters -->' + a_confirm_params);

			var a_unmatch_array = Rec_Obj.getFieldValue('custrecord_prd_unmatch_array');
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' a_unmatch_array -->' + a_unmatch_array);

			var a_unmatch_array_beforload = Rec_Obj.getFieldValue('custrecord_prd_unmatch_array_before_load');
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' a_unmatch_array_beforload -->' + a_unmatch_array_beforload);

			var a_reconcile_array_beforload = Rec_Obj.getFieldValue('custrecord_reconcile_array_bef_load');
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' a_reconcile_array_beforload -->' + a_reconcile_array_beforload);

			var i_user = Rec_Obj.getFieldValue('custrecord_prd_user');
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' User -->' + i_user);


			if (call_type == 2) {
				var custrecord_customer_id = Rec_Obj.getFieldValue('custrecord_customer_id'); // get customer id 
				var custrecord_edit_product_order_id = Rec_Obj.getFieldValue('custrecord_edit_product_order_id'); // get Product order id 
			}


			// ============== PRODUCT RECONCILLIATION PAGE PARAMS ===============
			var a_product_reconcilliation_array = get_product_reconcilliation_page_parameters();
			var i_unauthorized_item = a_product_reconcilliation_array[0].unauthorized_item;
			var a_authorized_bill_array = is_authorized_item_present(i_unauthorized_item);
			nlapiLogExecution('DEBUG', 'submitted_id ap order ', 'a_authorized_bill_array -->' + a_authorized_bill_array);

			//	var i_user = nlapiGetUser();

			nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 1 => ' + contextObj.getRemainingUsage());



			nlapiLogExecution('DEBUG', 'a_reconcile_array  ', 'a_reconcile_array -->' + a_reconcile_array);

			if (_logValidation(a_reconcile_array)) {

				nlapiLogExecution('DEBUG', 'Inside Check');
				if (_logValidation(a_reconcile_array_beforload) && _logValidation(a_unmatch_array_beforload)) {
					var a_temp_unmatch_split = a_unmatch_array_beforload.toString().split('][');
					var a_temp_reconcile_split = a_reconcile_array_beforload.toString().split('][');

					for (var a_i = 0; a_i < a_temp_reconcile_split.length; a_i++) {
						if (a_i == 0 && a_i == a_temp_reconcile_split.length - 1) {
							var a_reconcile_to_check = a_temp_reconcile_split[a_i];
						} else if (a_i == 0) {
							var a_reconcile_to_check = a_temp_reconcile_split[a_i] + ']';
						} else if (a_i == a_temp_reconcile_split.length - 1) {
							var a_reconcile_to_check = '[' + a_temp_reconcile_split[a_i];
						} else {
							var a_reconcile_to_check = '[' + a_temp_reconcile_split[a_i] + ']';
						}

						nlapiLogExecution('DEBUG', 'a_reconcile_array', a_reconcile_array);
						nlapiLogExecution('DEBUG', 'a_reconcile_to_check', a_reconcile_to_check);

						// check if the reconcile string already present or not 
						var f_is_present = a_reconcile_array.indexOf(a_reconcile_to_check);
						if (f_is_present != -1) {
							a_reconcile_array = a_reconcile_array.replace(a_reconcile_to_check, '');
						}


						nlapiLogExecution('DEBUG', 'f_is_present', f_is_present);

						if (f_is_present == -1) {
							var a_splitby_ = a_temp_unmatch_split[a_i].split('|');
							if (_logValidation(a_splitby_)) { // GET AP BILL DATA
								if (a_i == 0) {
									var app_bill_temp = a_splitby_[0].split('[');
									var app_bill = app_bill_temp[1];
								} else {
									var app_bill = a_splitby_[0];
								}

								var app_bill_item = a_splitby_[1];
								var difference_bill_qty = a_splitby_[2];
								var app_bill_original_qty = a_splitby_[3];

								// GET AP PRODUCT ORDER  DATA
								var app_prod_order = a_splitby_[6];
								var app_prod_order_item = a_splitby_[7];
								var difference_pr_ord_qty = a_splitby_[8];
								var ordignal_pr_ord_qty = a_splitby_[9];

								var status = a_splitby_[12];

								if (a_i == (a_temp_reconcile_split.length - 1)) {
									var statsuSplit = a_splitby_[12].split(']');
									status = statsuSplit[0]
								}

								// if (status == 'T') {
								// START UNMATCH AP PRODUCT ORDERS
								nlapiLogExecution('DEBUG', 'app_prod_order  ', 'app_prod_order -->' + app_prod_order);
								nlapiLogExecution('DEBUG', 'app_bill  ', 'app_bill -->' + app_bill);

								if (_logValidation(app_prod_order)) {
									var status_reconcile = nlapiLookupField('customrecord_mp_ap_product_order', app_prod_order, 'custrecord_ap_order_recon_status');
								}

								if (_logValidation(app_prod_order_item) && status_reconcile != 1) // not fully reconcile 
								{
									var obj_ap_prd_order = nlapiLoadRecord('customrecord_ap_stock_line_item', app_prod_order_item);
									var custrecord_ap_is_matching_done = obj_ap_prd_order.getFieldValue('custrecord_ap_is_matching_done');
									var custrecord_reconciled_ap_bill = obj_ap_prd_order.getFieldValues('custrecord_reconciled_ap_bill');
									var custrecord_ap_stock_line_actual_qty = obj_ap_prd_order.getFieldValue('custrecord_ap_stock_line_actual_qty');
									var custrecord_ap_line_recon_status = obj_ap_prd_order.getFieldValue('custrecord_ap_line_recon_status');
									var custrecord_ap_line_unrecon_qty = obj_ap_prd_order.getFieldValue('custrecord_ap_line_unrecon_qty');
									var mapp_array = new Array();

									if (_logValidation(custrecord_reconciled_ap_bill)) {
										for (var kk = 0; kk < custrecord_reconciled_ap_bill.length; kk++) {
											if (custrecord_reconciled_ap_bill[kk] != app_bill) {
												mapp_array[mapp_array.length] = custrecord_reconciled_ap_bill[kk];
											}
										}
									}
									nlapiLogExecution('DEBUG', 'mapp_array  ', 'mapp_array -->' + mapp_array);
									if (_logValidation(mapp_array)) {
										obj_ap_prd_order.setFieldValue('custrecord_reconciled_ap_bill', mapp_array);
										obj_ap_prd_order.setFieldValue('custrecord_ap_line_unrecon_qty', ordignal_pr_ord_qty);
										obj_ap_prd_order.setFieldValue('custrecord_ap_line_recon_status', 2);
										var submitted_id_ap_item = nlapiSubmitRecord(obj_ap_prd_order, true, true);
										var submitted_ap_ordr = nlapiSubmitField('customrecord_mp_ap_product_order', app_prod_order, 'custrecord_mapping_reconcilliation_statu', 3, true);
										var submitted_ap_ordr = nlapiSubmitField('customrecord_mp_ap_product_order', app_prod_order, 'custrecord_ap_order_recon_status', 3, true);
									} else {
										obj_ap_prd_order.setFieldValue('custrecord_ap_is_matching_done', 'F');
										obj_ap_prd_order.setFieldValue('custrecord_reconciled_ap_bill', '');
										obj_ap_prd_order.setFieldValue('custrecord_ap_line_recon_status', 3);
										obj_ap_prd_order.setFieldValue('custrecord_ap_line_unrecon_qty', '');
										var submitted_id_ap_item = nlapiSubmitRecord(obj_ap_prd_order, true, true);
										var a_flds_array = new Array();
										var a_values_array = new Array();

										a_flds_array = ['custrecord_mapping_reconcilliation_statu', 'custrecord_ap_p_color', 'custrecord_ap_order_recon_status'];
										a_values_array = [3, 2, 3];

										var submitted_ap_ordr = nlapiSubmitField('customrecord_mp_ap_product_order', app_prod_order, a_flds_array, a_values_array, true);

									}
								} // AP PRODUCT ORDER UNMATCHING DONE	

								nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 2 =>' + contextObj.getRemainingUsage());


								// AP BILL UNMTCHING 
								if (_logValidation(app_bill)) {
									var status_reconcile_ = nlapiLookupField('customrecord_mp_ap_stock_receipt', app_bill, 'custrecord_ap_stock_recon_status');
								}
								nlapiLogExecution('DEBUG', 'app_bill  ', 'app_bill -->' + app_bill);

								if (_logValidation(app_bill_item) && status_reconcile_ != 1) {
									var obj_ap_prd_order = nlapiLoadRecord('customrecord_ap_stock_line_item', app_bill_item);
									var custrecord_ap_is_matching_done = obj_ap_prd_order.getFieldValue('custrecord_ap_is_matching_done');
									var custrecord_reconciled_product_order = obj_ap_prd_order.getFieldValues('custrecord_reconciled_product_order');
									var custrecord_ap_stock_line_actual_qty = obj_ap_prd_order.getFieldValue('custrecord_ap_stock_line_actual_qty');
									var custrecord_ap_line_recon_status = obj_ap_prd_order.getFieldValue('custrecord_ap_line_recon_status');
									var custrecord_ap_line_unrecon_qty = obj_ap_prd_order.getFieldValue('custrecord_ap_line_unrecon_qty');

									var mapp_array = new Array();

									if (_logValidation(custrecord_reconciled_product_order)) {
										for (var kk = 0; kk < custrecord_reconciled_product_order.length; kk++) {
											if (custrecord_reconciled_product_order[kk] != app_prod_order) {
												mapp_array[mapp_array.length] = custrecord_reconciled_product_order[kk];
											}
										}
									}
									if (_logValidation(mapp_array)) {
										obj_ap_prd_order.setFieldValue('custrecord_reconciled_product_order', mapp_array);
										obj_ap_prd_order.setFieldValue('custrecord_ap_line_unrecon_qty', app_bill_original_qty);
										obj_ap_prd_order.setFieldValue('custrecord_ap_line_recon_status', 2);
										var submitted__bill_id = nlapiSubmitRecord(obj_ap_prd_order, true, true);

										// UPDATE STATUS ON AP BILL RECORD
										var ap_bill_order_Obj = nlapiLoadRecord('customrecord_mp_ap_stock_receipt', app_bill);
										ap_bill_order_Obj.setFieldValue('custrecord_bill_mapping_reconcilliation', 3);
										ap_bill_order_Obj.setFieldValue('custrecord_ap_stock_recon_status', 3);

										if (a_authorized_bill_array.indexOf(app_bill) == -1) {
											ap_bill_order_Obj.setFieldValue('custrecord_ap_s_color', 2);
										}

										var submitted_ap_reciept = nlapiSubmitRecord(ap_bill_order_Obj, false, false);
									} else {
										obj_ap_prd_order.setFieldValue('custrecord_reconciled_product_order', '');
										obj_ap_prd_order.setFieldValue('custrecord_ap_is_matching_done', 'F');
										obj_ap_prd_order.setFieldValue('custrecord_reconciled_ap_bill', '');
										obj_ap_prd_order.setFieldValue('custrecord_ap_line_recon_status', 3);
										obj_ap_prd_order.setFieldValue('custrecord_ap_line_unrecon_qty', '');
										var submitted__bill_id = nlapiSubmitRecord(obj_ap_prd_order, false, false);

										// UPDATE STATUS ON AP BILL RECORD
										var ap_bill_order_Obj = nlapiLoadRecord('customrecord_mp_ap_stock_receipt', app_bill);

										ap_bill_order_Obj.setFieldValue('custrecord_bill_mapping_reconcilliation', 3);
										ap_bill_order_Obj.setFieldValue('custrecord_ap_stock_recon_status', 3);

										if (a_authorized_bill_array.indexOf(app_bill) == -1) {
											ap_bill_order_Obj.setFieldValue('custrecord_ap_s_color', 2);
										}

										var submitted_ap_reciept = nlapiSubmitRecord(ap_bill_order_Obj);
									}

									nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 3  => ' + contextObj.getRemainingUsage());

								} // AP BILL UNMATCHING DONE
								// }


							}
						}
					} // end of if
				} // end of for loop 
			} // end of if



			nlapiLogExecution('DEBUG', 'a_unmatch_array  ', 'a_unmatch_array -->' + a_unmatch_array);

			// MAKE NOTEPAD FOR THE 
			if (_logValidation(a_unmatch_array)) {
				var Record_id_ = get_Unmatch_File(i_user)
				if (_logValidation(Record_id_)) {
					var s_file_name = 'Unmatched AP Bill and Product Order_' + i_user + '.txt'
					var file_obj = nlapiCreateFile(s_file_name, 'PLAINTEXT', a_unmatch_array.toString());
					file_obj.setFolder(1765674);
					var file_ID = nlapiSubmitFile(file_obj);
					nlapiLogExecution('DEBUG', 'post_restlet_function', ' file_ID -->' + file_ID);
					var i_attach_on_record = nlapiSubmitField('customrecord_pr_mappings', Record_id_, 'custrecord_unmatching_csv_file', file_ID, true)
				}
			}

			nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 4 =>' + contextObj.getRemainingUsage());


			var a_TT_array_values = new Array();
			var i_data_TT = new Array();
			i_data_TT = a_reconcile_array;

			if (_logValidation(i_data_TT)) {
				for (var dt = 0; dt < i_data_TT.length; dt++) {
					a_TT_array_values = i_data_TT.split('][');
					break;
				}
			} //Data TT		

			nlapiLogExecution('DEBUG', 'a_TT_array_values  ', 'a_TT_array_values -->' + a_TT_array_values);

			// a_LINK_array_values = a_linking_array;

			var a_UN_array_values = new Array();
			var i_data_TT = new Array();
			i_data_TT = a_unmatch_array_original;

			if (_logValidation(i_data_TT)) {
				for (var dt = 0; dt < i_data_TT.length; dt++) {
					a_UN_array_values = i_data_TT.split('][');
					break;
				}
			} //Data TT		 

			nlapiLogExecution('DEBUG', 'a_UN_array_values  ', 'a_UN_array_values -->' + a_UN_array_values);

			var a_LINK_array_values = new Array();
			var i_data_TT = new Array();
			i_data_TT = a_linking_array;

			if (_logValidation(i_data_TT)) {
				for (var dt = 0; dt < i_data_TT.length; dt++) {
					a_LINK_array_values = i_data_TT.split('][');
					break;
				}
				nlapiLogExecution('DEBUG', 'post_restlet_function', ' Linking Array -->' + a_LINK_array_values);
				nlapiLogExecution('DEBUG', 'post_restlet_function', ' Linking Array Length -->' + a_LINK_array_values.length);
			} //Data TT


			var i_product_mappings_ID = product_reconcilliation_mappings(i_user);
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' Product Reconcilliation Mappings ID -->' + i_product_mappings_ID);

			if (_logValidation(i_product_mappings_ID)) {
				var o_product_mappingsOBJ = nlapiLoadRecord('customrecord_pr_mappings', i_product_mappings_ID, {
					recordmode: 'dynamic'
				});

				var a_mappings = o_product_mappingsOBJ.getFieldValue('custrecord_apbill_approduct_mappings');

				// if(_logValidation(a_mappings))
				//{
				//  a_mappings = a_mappings+a_linking_array;			  
				//}
				//else
				{
					a_mappings = a_linking_array;
				}
				o_product_mappingsOBJ.setFieldValue('custrecord_apbill_approduct_mappings', a_mappings);

				var i_submit_product_mappingsID = nlapiSubmitRecord(o_product_mappingsOBJ, true, true);
				nlapiLogExecution('DEBUG', 'post_restlet_function', ' ------ Product Reconcilliation Mappings Submit ID {EDIT}-->' + i_submit_product_mappingsID);



			} else {
				var o_product_mappingsOBJ = nlapiCreateRecord('customrecord_pr_mappings', {
					recordmode: 'dynamic'
				});

				o_product_mappingsOBJ.setFieldValue('custrecord_apbill_approduct_mappings', a_LINK_array_values);

				var i_submit_product_mappingsID = nlapiSubmitRecord(o_product_mappingsOBJ, true, true);
				nlapiLogExecution('DEBUG', 'post_restlet_function', ' ------ Product Reconcilliation Mappings Submit ID {CREATE}-->' + i_submit_product_mappingsID);

			}



			nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 5 =>' + contextObj.getRemainingUsage());



			var a_AP_Bill_array = new Array();
			var a_AP_Product_array = new Array();
			var s_str = '';
			var a_AP_Bill_Mapping_array = new Array();
			var AP_Product_Mapping_array = new Array();
			var a_bill_array = new Array();
			var a_product_array = new Array();
			nlapiLogExecution('DEBUG', 'a_TT_array_values  ', 'a_TT_array_values -->' + a_TT_array_values);
			nlapiLogExecution('DEBUG', 'a_TT_array_values Length ', a_TT_array_values.length);

			if (_logValidation(a_TT_array_values)) {
				for (var t_x = 0; t_x < a_TT_array_values.length; t_x++) {

					nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 6 => ' + contextObj.getRemainingUsage());
					var a_reconcile_array = a_TT_array_values[t_x];

					if (_logValidation(a_reconcile_array)) {
						var a_split_rec_array = new Array();

						a_split_rec_array = a_reconcile_array.split('|');

						var i_bill_1_G = a_split_rec_array[0];
						var i_AP_Line_ID_1 = a_split_rec_array[1];
						var i_unreconcilled_qty_1 = a_split_rec_array[2];
						var i_bill_2_G = a_split_rec_array[3];
						var i_AP_Line_ID_2 = a_split_rec_array[4];
						var i_unreconcilled_qty_2 = a_split_rec_array[5];
						var status = a_split_rec_array[6];

						i_bill_1_G = i_bill_1_G.replace(/[^.0-9]/g, "");
						i_unreconcilled_qty_2 = i_unreconcilled_qty_2.replace(/[^.0-9]/g, "");

						nlapiLogExecution('DEBUG', 'status', status);
						if (status == 'T' || status == 'T]') {
							if (_logValidation(i_AP_Line_ID_1)) {

								nlapiLogExecution('DEBUG', 'INSIDE');

								var o_AP_Line_OBJ_1 = nlapiLoadRecord('customrecord_ap_stock_line_item', i_AP_Line_ID_1);

								o_AP_Line_OBJ_1.setFieldValue('custrecord_ap_line_unrecon_qty', i_unreconcilled_qty_1);

								a_AP_Bill_Mapping_array.push(i_bill_1_G + '&%$$' + i_AP_Line_ID_2);
								AP_Product_Mapping_array.push(i_bill_2_G + '&%$$' + i_AP_Line_ID_1);
								a_bill_array.push(i_bill_1_G);
								a_product_array.push(i_bill_2_G);

								if (i_unreconcilled_qty_1 == 0) {
									o_AP_Line_OBJ_1.setFieldValue('custrecord_ap_line_recon_status', 1);
								} else {
									o_AP_Line_OBJ_1.setFieldValue('custrecord_ap_line_recon_status', 2);
								}
								o_AP_Line_OBJ_1.setFieldValue('custrecord_ap_is_matching_done', 'T');

								var i_AP_Product_ID_arr = o_AP_Line_OBJ_1.getFieldValues('custrecord_reconciled_product_order');
								nlapiLogExecution('DEBUG', 'schedulerFunction', 'AP Product Order # -->' + i_AP_Product_ID_arr);

								if (_logValidation(i_AP_Product_ID_arr)) {
									for (var t_2 = 0; t_2 < i_AP_Product_ID_arr.length; t_2++) {
										a_AP_Product_array.push(i_AP_Product_ID_arr[t_2]);
									}
									a_AP_Product_array.push(i_bill_2_G);
								} else {
									a_AP_Product_array.push(i_bill_2_G);
								}

								o_AP_Line_OBJ_1.setFieldValues('custrecord_reconciled_product_order', a_AP_Product_array);
								var a_AP_Product_array = new Array();

								var i_submit_ID_1 = nlapiSubmitRecord(o_AP_Line_OBJ_1, true, true);
								nlapiLogExecution('DEBUG', 'schedulerFunction', '------- AP LINE SUBMIT ID 1 -------->' + i_submit_ID_1);
							} //Product Order	 

							nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 7 =>' + contextObj.getRemainingUsage());

							if (_logValidation(i_AP_Line_ID_2)) {
								var o_AP_Line_OBJ_2 = nlapiLoadRecord('customrecord_ap_stock_line_item', i_AP_Line_ID_2);

								o_AP_Line_OBJ_2.setFieldValue('custrecord_ap_line_unrecon_qty', i_unreconcilled_qty_2);

								if (i_unreconcilled_qty_2 == 0) {
									o_AP_Line_OBJ_2.setFieldValue('custrecord_ap_line_recon_status', 1);
								} else {
									o_AP_Line_OBJ_2.setFieldValue('custrecord_ap_line_recon_status', 2);
								}
								o_AP_Line_OBJ_2.setFieldValue('custrecord_ap_is_matching_done', 'T');

								var a_AP_Bill_ID_arr = o_AP_Line_OBJ_2.getFieldValues('custrecord_reconciled_ap_bill');
								nlapiLogExecution('DEBUG', 'schedulerFunction', 'AP Bill # -->' + a_AP_Bill_ID_arr);

								if (_logValidation(a_AP_Bill_ID_arr)) {
									for (var t_1 = 0; t_1 < a_AP_Bill_ID_arr.length; t_1++) {
										a_AP_Bill_array.push(a_AP_Bill_ID_arr[t_1]);
									}
									a_AP_Bill_array.push(i_bill_1_G);
									//   s_str = i_AP_Bill_ID+','+i_bill_1_G;
								} else {
									a_AP_Bill_array.push(i_bill_1_G);
								}
								o_AP_Line_OBJ_2.setFieldValues('custrecord_reconciled_ap_bill', a_AP_Bill_array);
								var a_AP_Bill_array = new Array();

								var i_submit_ID_1 = nlapiSubmitRecord(o_AP_Line_OBJ_2, true, true);
								nlapiLogExecution('DEBUG', 'schedulerFunction', '------- AP LINE SUBMIT ID 2 -------->' + i_submit_ID_1);
							} //Product Order    
							nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 8 => ' + contextObj.getRemainingUsage());
						}


					} //Reconcile Array	      
				} //TT Array Values Loop	 

				a_AP_Bill_Mapping_array = remove_duplicates(a_AP_Bill_Mapping_array);
				AP_Product_Mapping_array = remove_duplicates(AP_Product_Mapping_array);
				a_bill_array = remove_duplicates(a_bill_array);
				a_product_array = remove_duplicates(a_product_array);

				var a_bill_A_1 = new Array();
				var a_bill_S_A_1 = new Array();

				if (_logValidation(a_bill_array) && _logValidation(a_AP_Bill_Mapping_array)) {
					var a_split_1_array = new Array();

					for (var i_1 = 0; i_1 < a_bill_array.length; i_1++) {
						nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 9 => ' + contextObj.getRemainingUsage());

						var a_unmatch_ARR = new Array();
						if (_logValidation(a_bill_array[i_1])) {
							for (var i_2 = 0; i_2 < a_AP_Bill_Mapping_array.length; i_2++) {
								a_split_1_array = a_AP_Bill_Mapping_array[i_2].split('&%$$');

								var i_bill_A = a_split_1_array[0];
								var i_AP_Line_1_A = a_split_1_array[1];

								if (i_bill_A == a_bill_array[i_1]) {
									a_bill_A_1.push(i_AP_Line_1_A);
								}
							}
							// ====== AP Bill Mappings ==========

							if (_logValidation(a_UN_array_values)) {
								for (var u_t_x = 0; u_t_x < a_UN_array_values.length; u_t_x++) {
									var a_unmatched_array = a_UN_array_values[u_t_x];

									if (_logValidation(a_unmatched_array)) {
										var a_split_rec_array_UN = new Array();

										a_split_rec_array_UN = a_unmatched_array.split('|');

										var i_bill_1_G_N = a_split_rec_array_UN[0];

										i_bill_1_G_N = i_bill_1_G_N.replace(/[^.0-9]/g, "");

										if (i_bill_1_G_N == a_bill_array[i_1]) {
											if (_logValidation(a_unmatch_ARR)) {
												a_unmatch_ARR = a_unmatch_ARR + ',' + a_unmatched_array;
											} else {
												a_unmatch_ARR = a_unmatched_array;
											}
										}
									}
								}
							}

							var o_AP_Bill_OBJ = nlapiLoadRecord('customrecord_mp_ap_stock_receipt', a_bill_array[i_1]);

							/*
				    	 
				    	 var a_AP_line_arr  = o_AP_Bill_OBJ.getFieldValues('custrecord_ap_line');
				    	   
				    	  if(_logValidation(a_AP_line_arr))
			    		  {
				    		   for(var t_1 = 0 ;t_1<a_AP_line_arr.length;t_1++)
			    			   {
				    			   a_bill_A_1.push(a_AP_line_arr[t_1]);	    			   
			    			   } 		    	
			    		  }
				    	  
				    	  o_AP_Bill_OBJ.setFieldValues('custrecord_ap_line',a_bill_A_1);   	
				    	  
				    	  o_AP_Bill_OBJ.setFieldValue('custrecord_quantity_wise_mappings',a_unmatch_ARR);   		
				    	  
				    	  */

							o_AP_Bill_OBJ.setFieldValue('custrecord_ap_s_color', 1);

							var i_AP_Bill_SubmitID = nlapiSubmitRecord(o_AP_Bill_OBJ, true, true);
							nlapiLogExecution('DEBUG', 'schedulerFunction', '------- AP Bill SUBMIT ID 1 -------->' + i_AP_Bill_SubmitID);
						}
						nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 10 => ' + contextObj.getRemainingUsage());
					}

				}
				var a_bill_A_2 = new Array();
				var a_bill_S_A_2 = new Array();

				if (_logValidation(a_product_array) && _logValidation(AP_Product_Mapping_array)) {
					var a_split_2_array = new Array();

					for (var i_1 = 0; i_1 < a_product_array.length; i_1++) {
						nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 11 => ' + contextObj.getRemainingUsage());

						if (_logValidation(a_product_array[i_1])) {
							for (var i_2 = 0; i_2 < AP_Product_Mapping_array.length; i_2++) {
								a_split_2_array = AP_Product_Mapping_array[i_2].split('&%$$');

								var i_bill_A = a_split_2_array[0];
								var i_AP_Line_1_A = a_split_2_array[1];

								if (i_bill_A == a_product_array[i_1]) {
									a_bill_A_2.push(i_AP_Line_1_A);
								}
							}

							// ====== AP Bill Mappings ==========

							var o_AP_Bill_OBJ = nlapiLoadRecord('customrecord_mp_ap_product_order', a_product_array[i_1]);

							/*
				    	 
				    	 var a_AP_line_arr  = o_AP_Bill_OBJ.getFieldValues('custrecord_p_ap_line');
				    	   
				    	  if(_logValidation(a_AP_line_arr))
			    		  {
				    		   for(var t_1 = 0 ;t_1<a_AP_line_arr.length;t_1++)
			    			   {
				    			   a_bill_A_2.push(a_AP_line_arr[t_1]);	    			   
			    			   } 		    	
			    		  }
				    	   
				    	 o_AP_Bill_OBJ.setFieldValues('custrecord_p_ap_line',a_bill_A_2);  
				    	 */

							o_AP_Bill_OBJ.setFieldValue('custrecord_ap_p_color', 1);
							var i_AP_Bill_SubmitID = nlapiSubmitRecord(o_AP_Bill_OBJ, true, true);
							nlapiLogExecution('DEBUG', 'schedulerFunction', '------- AP Bill SUBMIT ID 2 -------->' + i_AP_Bill_SubmitID);
						}
						nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 12=> ' + contextObj.getRemainingUsage());

					}
				}
			} //TT Array Values			 
			// =========== CANCEL FUNCTIONALITY ===============

			if (_logValidation(a_cancel_params)) {
				nlapiLogExecution('DEBUG', 'schedulerFunction', '------- a_cancel_params-------->' + a_cancel_params);

				var o_product_orderOBJ = nlapiLoadRecord('customrecord_mp_ap_product_order', a_cancel_params);

				o_product_orderOBJ.setFieldValue('custrecord_mp_ap_order_order_status', 5);

				var i_submit_ID_C = nlapiSubmitRecord(o_product_orderOBJ, true, true);
				nlapiLogExecution('DEBUG', 'schedulerFunction', '------- Submit ID Cancelled -------->' + i_submit_ID_C);
			}
			// =========== DELIVER FUNCTIONALITY ===============
			nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 13 =>' + contextObj.getRemainingUsage());

			if (_logValidation(a_deliver_params)) {
				var o_product_orderOBJ = nlapiLoadRecord('customrecord_mp_ap_product_order', a_deliver_params);

				o_product_orderOBJ.setFieldValue('custrecord_mp_ap_order_order_status', 4);
				o_product_orderOBJ.setFieldValue('custrecord_ap_order_fulfillment_date', getDate());

				var i_submit_ID_D = nlapiSubmitRecord(o_product_orderOBJ, true, true);
				nlapiLogExecution('DEBUG', 'schedulerFunction', '------- Submit ID Delivered -------->' + i_submit_ID_D);
			}
			// ================== CONFIRM FUNCTIONALITY ==============
			nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 14 => ' + contextObj.getRemainingUsage());


			if (_logValidation(a_confirm_params)) {
				var a_unauthorized_array_I = new Array();
				var s_AUTH_FLAG = false;

				// ======= Check If All Are Unauthorized ========


				var filter_C = new Array();
				filter_C[0] = new nlobjSearchFilter('custrecord_ap_stock_line_stock_receipt', null, 'is', a_confirm_params);

				var columns_C = new Array();
				columns_C[0] = new nlobjSearchColumn('internalid');

				var a_search_results_C = nlapiSearchRecord('customrecord_ap_stock_line_item', null, filter_C, columns_C);
				nlapiLogExecution('DEBUG', 'schedulerFunction', '------- Search Results Confirm  -------->' + a_search_results_C);

				var filter = new Array();
				filter[0] = new nlobjSearchFilter('custrecord_ap_stock_line_stock_receipt', null, 'is', a_confirm_params);
				filter[1] = new nlobjSearchFilter('custrecord_ap_stock_line_item', null, 'is', i_unauthorized_item);

				var columns = new Array();
				columns[0] = new nlobjSearchColumn('internalid');

				var a_search_results = nlapiSearchRecord('customrecord_ap_stock_line_item', null, filter, columns);

				if (_logValidation(a_search_results)) {
					nlapiLogExecution('DEBUG', 'schedulerFunction', ' No. of Bills found --->' + a_search_results);

					for (var cn = 0; cn < a_search_results.length; cn++) {
						var i_bill_ID = a_search_results[cn].getValue('internalid');
						nlapiLogExecution('DEBUG', 'schedulerFunction', ' Bill ID --->' + i_bill_ID);

						a_unauthorized_array_I.push(i_bill_ID);

						if (_logValidation(i_bill_ID)) {
							var o_AP_Line_OBJ = nlapiLoadRecord('customrecord_ap_stock_line_item', i_bill_ID);

							o_AP_Line_OBJ.setFieldValue('custrecord_ap_line_recon_status', 6);
							o_AP_Line_OBJ.setFieldValue('custrecord_ap_line_unrecon_qty', 0);
							o_AP_Line_OBJ.setFieldValue('custrecord_ap_is_matching_done', 'T');

							var i_submit_ID_C = nlapiSubmitRecord(o_AP_Line_OBJ, true, true);
							nlapiLogExecution('DEBUG', 'schedulerFunction', '------- Submit ID Confirm -------->' + i_submit_ID_C);
						}
					}
				}

				if (_logValidation(a_search_results_C) && _logValidation(a_unauthorized_array_I)) {
					nlapiLogExecution('DEBUG', 'schedulerFunction', '------- Overall Search AP Bill  -------->' + a_search_results_C.length);
					nlapiLogExecution('DEBUG', 'schedulerFunction', '------- Unauthorized Array  -------->' + a_unauthorized_array_I.length);

					if (a_search_results_C.length == a_unauthorized_array_I.length) {
						s_AUTH_FLAG = true;
					}
				}


				var o_AP_stock_OBJ = nlapiLoadRecord('customrecord_mp_ap_stock_receipt', a_confirm_params);

				o_AP_stock_OBJ.setFieldValue('custrecord_ap_s_color', 1);

				if (s_AUTH_FLAG == true) {
					o_AP_stock_OBJ.setFieldValue('custrecord_ap_stock_recon_status', 1);
					o_AP_stock_OBJ.setFieldValue('custrecord_bill_mapping_reconcilliation', 1);
				}

				var i_submit_stock_ID_C = nlapiSubmitRecord(o_AP_stock_OBJ, true, true);
				nlapiLogExecution('DEBUG', 'schedulerFunction', '------- Submit ID Confirm -------->' + i_submit_stock_ID_C);

				/*			   
				   for(var cp = 0 ;cp<a_confirm_params.length ;cp++)
				   {
					   if(_logValidation(a_confirm_params[cp]))
					   {
					   
						   a_flds_array = ['custrecord_ap_s_color'];
			    	       a_values_array = [1];
			    	    	
			    	       nlapiLogExecution('DEBUG', 'schedulerFunction','------- a_confirm_params[cp] -------->' +a_confirm_params);	    		  
			    	       var submitted_ap_ordr = nlapiSubmitField('customrecord_mp_ap_stock_receipt', a_confirm_params,a_flds_array,a_values_array, true);
			    	       nlapiLogExecution('DEBUG', 'submitted_id ap order ', ' submitted_ap_ordr -->'+submitted_ap_ordr);
					   }
				   
				   }
				  */
				nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 15 => ' + contextObj.getRemainingUsage());

			}

			// To blank the record 
			if (!_logValidation(call_type)) {

				var params = {
					custscript_id: i_user
				};



				Rec_Obj.setFieldValue('custrecord_prd_reconcile_array', ''); // main reconcile Array
				Rec_Obj.setFieldValue('custrecord_prd_linking_array', ''); // Linking Array 
				Rec_Obj.setFieldValue('custrecord_prd_unmatch_array', ''); // Unmatch Array 
				Rec_Obj.setFieldValue('custrecord_prd_unmatch_array_before_load', ''); // Unmatch Array BeforeLoad 
				Rec_Obj.setFieldValue('custrecord_prd_bill_to_date', ''); // To  Date Bill 
				Rec_Obj.setFieldValue('custrecord_prd_bill_from_date', ''); // From  Date Bill 
				Rec_Obj.setFieldValue('custrecord_prd_product_from_date', ''); // From  Date AP Order 
				Rec_Obj.setFieldValue('custrecord_prd_product_to_date', ''); // To Date AP Order 
				Rec_Obj.setFieldValue('custrecord_prd_unmatched_array_global', ''); // Unmatch Global 
				Rec_Obj.setFieldValue('custrecord_reconcile_array_bef_load', ''); // Set Current User 
				var i_submit = nlapiSubmitRecord(Rec_Obj, true, true);
				nlapiLogExecution('DEBUG', 'schedulerFunction', '------- Product Reconcilliation Data -------->' + i_submit);

				// var status = nlapiScheduleScript('customscript_sch_pr_mappings_updation', 'customdeploy2', params);
				// if (status == 'QUEUED') {

				var params = new Array();
				params['ap_bill_from_date'] = d_ap_bill_from_date;
				params['ap_bill_to_date'] = d_ap_bill_to_date;
				params['ap_product_from_date'] = d_ap_product_from_date;
				params['ap_product_to_date'] = d_ap_product_to_date;
				params['custscript_partner'] = i_user;
				nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 16 => ' + contextObj.getRemainingUsage());

				nlapiSetRedirectURL('SUITELET', 'customscript_sut_product_reconcilliation', 'customdeploy_sut_product_reconcilliation', null, params);

				return false;
				// }

			}
			if (call_type == 2) // Edit 
			{
				// var url_to_Call = nlapiResolveURL('SUITELET', 'customscript_sl_auspost_create_order', 'customdeploy_sl_auspost_create_order');
				nlapiLogExecution('DEBUG', 'custrecord_customer_id', 'custrecord_customer_id>' + custrecord_customer_id);
				nlapiLogExecution('DEBUG', 'custrecord_edit_product_order_id', 'custrecord_edit_product_order_id -->' + custrecord_edit_product_order_id);

				var null_value = 'null';

				var params = new Array();
				params['customer_id'] = null_value.toString(); // custrecord_customer_id;	
				params['product_order_id'] = custrecord_edit_product_order_id;
				params['custscript_partner'] = i_user;
				params['ap_bill_from_date'] = d_ap_bill_from_date;
				params['ap_bill_to_date'] = d_ap_bill_to_date;
				params['ap_product_from_date'] = d_ap_product_from_date;
				params['ap_product_to_date'] = d_ap_product_to_date;
				params['product_reconcilliation_parameter'] = 'PRODUCT_RECONCILLIATION_DATA';
				nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 17 => ' + contextObj.getRemainingUsage());


				nlapiSetRedirectURL('SUITELET', 'customscript_sl_auspost_create_order', 'customdeploy_sl_auspost_create_order', null, params)
			}
			if (call_type == 1) // Dispute
			{

				nlapiLogExecution('DEBUG', 'submitted_id INNap order ', 'custrecord_dispute_file_type -->' + custrecord_dispute_file_type);

				var custrecord_dispute_ap_bill_id = Rec_Obj.getFieldValue('custrecord_dispute_ap_bill_id'); // Set Current User 
				var custrecord_dispute_type = Rec_Obj.getFieldValue('custrecord_dispute_type'); // Set Current User 
				var custrecord_dispute_file_upload = Rec_Obj.getFieldValue('custrecord_dispute_file_upload'); // Set Current User 
				var custrecord_dispute_upload_file_id = Rec_Obj.getFieldValue('custrecord_dispute_upload_file_id'); // Set Current User 
				var custrecord_dispute_file_type = Rec_Obj.getFieldValue('custrecord_dispute_file_type'); // Set Current User 

				nlapiLogExecution('DEBUG', 'submitted_id ap order ', 'custrecord_dispute_file_type -->' + custrecord_dispute_file_type);

				var params = new Array();
				params['ap_stock_receipt_id'] = custrecord_dispute_ap_bill_id;
				params['type'] = custrecord_dispute_type;
				params['upload_file'] = 'F';
				params['upload_file_id'] = null;
				params['file_type'] = 'T';
				params['custscript_partner'] = i_user;
				params['ap_bill_from_date'] = d_ap_bill_from_date;
				params['ap_bill_to_date'] = d_ap_bill_to_date;
				params['ap_product_from_date'] = d_ap_product_from_date;
				params['ap_product_to_date'] = d_ap_product_to_date;
				params['product_reconcilliation_parameter'] = 'PRODUCT_RECONCILLIATION_DATA';

				// var url_to_Call = nlapiResolveURL('SUITELET', 'customscript_sl_auspost_create_order', 'customdeploy_sl_auspost_create_order');
				nlapiLogExecution('DEBUG', 'custrecord_customer_id', 'custrecord_customer_id>');
				nlapiLogExecution('DEBUG', 'custrecord_edit_product_order_id', 'custrecord_edit_product_order_id -->');

				nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 18 =>  ' + contextObj.getRemainingUsage());

				nlapiSetRedirectURL('SUITELET', 'customscript_sl_salesbtns_upload_file', 'customdeploy_sl_salesbtns_upload_file', null, params)
			}
			if (call_type == 3) // Add New Order 
			{

				var prod_recon = Rec_Obj.getFieldValue('custrecord_add_new_order_product_recon'); // Set Current User 
				var product_order_id = Rec_Obj.getFieldValue('custrecord_add_new_order_product_orderid'); // Set Current User 
				var customer_id = Rec_Obj.getFieldValue('custrecord_add_new_order_customer_id'); // Set Current User 

				var null_value = 'null';

				var params = new Array();
				params['prod_recon'] = prod_recon;
				params['product_order_id'] = null_value.toString();
				params['customer_id'] = null_value.toString();
				params['custscript_partner'] = i_user;
				params['ap_bill_from_date'] = d_ap_bill_from_date;
				params['ap_bill_to_date'] = d_ap_bill_to_date;
				params['ap_product_from_date'] = d_ap_product_from_date;
				params['ap_product_to_date'] = d_ap_product_to_date;
				params['product_reconcilliation_parameter'] = 'PRODUCT_RECONCILLIATION_DATA';
				nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'Remaining usge 19 => ' + contextObj.getRemainingUsage());

				nlapiSetRedirectURL('SUITELET', 'customscript_sl_auspost_create_order', 'customdeploy_sl_auspost_create_order', null, params)
			}
			/*
			 if(!_logValidation(call_type)
			 {
				 var params = new Array();					
				 params['ap_bill_from_date'] = d_ap_bill_from_date;	
				 params['ap_bill_to_date'] = d_ap_bill_to_date;	
				 params['ap_product_from_date'] = d_ap_product_from_date ;	
				 params['ap_product_to_date'] = d_ap_product_to_date;	
				 params['custscript_partner'] = i_user;	
				 
			     nlapiSetRedirectURL('SUITELET', 'customscript_sut_product_reconcilliation', 'customdeploy_sut_product_reconcilliation', null,params);
			   
			 }
			*/
		} // End of log block

		nlapiLogExecution('DEBUG', 'sut_StockReport GET', 'End of script execution Remaining usge 20 => ' + contextObj.getRemainingUsage());

	} // End of try block
	catch (exception) {
		nlapiLogExecution('DEBUG', 'ERROR', ' Exception Caught -->' + exception);
	}
} //Suitelet Function
/** 
 * @param value
 * @returns
 */
function _logValidation(value) {
	if (value != null && value != undefined && value != '' && value != 'NaN' && value != ' ') {
		return true;
	} else {
		return false;
	}
}

function get_product_reconcilliation_page_parameters() {
	var a_data_array = new Array();

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_jquery_library_file');
	columns[2] = new nlobjSearchColumn('custrecord_jquery_css_file');
	columns[3] = new nlobjSearchColumn('custrecord_item_unauthorized');

	var a_search_results = nlapiSearchRecord('customrecord_product_reconcilliation_pag', null, null, columns);

	if (_logValidation(a_search_results)) {
		var URL_JQuery_library_file = a_search_results[0].getValue('custrecord_jquery_library_file');
		var URL_JQuery_CSS_file = a_search_results[0].getValue('custrecord_jquery_css_file');
		var i_unauthorized_item = a_search_results[0].getValue('custrecord_item_unauthorized');

		a_data_array[0] = {
			'jquery_lib_file': URL_JQuery_library_file,
			'jquery_css_file': URL_JQuery_CSS_file,
			'unauthorized_item': i_unauthorized_item
		};

	} //Search Results
	return a_data_array;
} //Product Reconcilliation Page Parameters
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

function product_reconcilliation_mappings(i_user) {
	var i_value = '';

	var columns = new Array();
	var a_filters = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	a_filters[0] = new nlobjSearchFilter('custrecord_partner_user', null, 'is', i_user);
	var a_search_results = nlapiSearchRecord('customrecord_pr_mappings', null, a_filters, columns);

	if (_logValidation(a_search_results)) {
		var i_pr_mappings_ID = a_search_results[0].getValue('internalid');

		i_value = i_pr_mappings_ID;
	}
	return i_value;
} //Product Reconcilliation Mappings

//GET THE UNMATCH FILE 
function get_Unmatch_File(i_user) {
	var i_value = '';
	var i_pr_mappings_ID = '';
	var columns = new Array();
	var a_filters = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_unmatching_csv_file');
	a_filters[0] = new nlobjSearchFilter('custrecord_partner_user', null, 'is', i_user);
	var a_search_results = nlapiSearchRecord('customrecord_pr_mappings', null, a_filters, columns);

	if (_logValidation(a_search_results)) {
		i_pr_mappings_ID = a_search_results[0].getValue('internalid');

		var i_pr_unmatch = a_search_results[0].getValue('custrecord_unmatching_csv_file');

		if (_logValidation(i_pr_unmatch)) {
			i_value = i_pr_unmatch;
		}
	}
	return i_pr_mappings_ID;
}

function is_authorized_item_present(i_unauthorized_item) {
	var a_value_array = new Array();

	if (_logValidation(i_unauthorized_item)) {
		var columns = new Array();
		var a_filters = new Array();

		columns[0] = new nlobjSearchColumn('custrecord_ap_stock_line_stock_receipt');

		a_filters[0] = new nlobjSearchFilter('custrecord_ap_stock_line_item', null, 'is', i_unauthorized_item);
		a_filters[1] = new nlobjSearchFilter('custrecord_ap_line_recon_status', null, 'is', 6);

		var a_search_results = nlapiSearchRecord('customrecord_ap_stock_line_item', null, a_filters, columns);

		if (_logValidation(a_search_results)) {
			for (var b_z = 0; b_z < a_search_results.length; b_z++) {
				var i_AP_BillID = a_search_results[b_z].getValue('custrecord_ap_stock_line_stock_receipt');
				a_value_array.push(i_AP_BillID);
			}
		}
	}

	return a_value_array;
} //Product Reconcilliation Mappings