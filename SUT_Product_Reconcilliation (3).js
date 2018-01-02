/**
 * Script Name : SUT_Product_Reconcilliation
 * Date        : 1 Nov 2016
 * Author      : Shweta Chopde 
 * Description : The script is designed to develop a UI with drag & drop functionality for AP Product & AP Bill records
 * 
 */

var base_url = 'https:\/\/system.na2.netsuite.com';

var jquery_min = base_url + '\/core\/media\/media.nl?id=2029299&c=1048144&h=2debf7d663fd7835d105&mv=j3cayyeo&_xt=.js';
var jquery_ui = base_url + '\/core\/media\/media.nl?id=2029298&c=1048144&h=1502bac774a6a571e9a8&mv=j3cayp5c&_xt=.js';
var jquery_ui_css = base_url + '\/core\/media\/media.nl?id=2029301&c=1048144&h=12089fe13214e81abffe&mv=j3caz8fs&_xt=.css';
var icon_css = base_url + '\/core\/media\/media.nl?id=2029300&c=1048144&h=28f681eb6393cc918fe5&mv=j3caz31c&_xt=.css';
var sut_recon_deploy_script_with_partnerid = base_url + '\/app\/site\/hosting\/scriptlet.nl?script=648&deploy=1&custscript_partner=';
var sut_recon_deploy_script = base_url + '\/app\/site\/hosting\/scriptlet.nl?script=648&deploy=1';
var x_icon_image = base_url + '\/core\/media\/media.nl?id=2029089&c=1048144&h=2df059537c817931cf11';
var drag_icon_image = base_url + '\/core\/media\/media.nl?id=2029088&c=1048144&h=84b944e3f008a2ab3815';


function suiteletFunction(request, response) {

	var matchings = 0;
	var a_product_mapping_OVERALL_array = new Array();
	var a_bill_mapping_OVERALL_array = new Array();
	var a_GLOBAL_unmatch_array = new Array();
	var a_unauthorised_array = '';
	var i_user = nlapiGetUser();
	//	280703 452187 219412
	// DECLARE 2 ARRAY TO FOR SCROLLABLE FUNCTIONALITY 
	var a_Bill_Array_scroll = new Array();
	var a_AP_Order_Array_scroll = new Array();
	var a_AP_Order_Array_scroll_temp = new Array();

	var s_full_access = true;

	var f_partner = isPartner(i_user);
	nlapiLogExecution('DEBUG', 'post_restlet_function', ' Is Partner ? -->' + f_partner);

	if (request.getMethod() == 'GET') {
		var i_partner = request.getParameter('custscript_partner');
		nlapiLogExecution('DEBUG', 'post_restlet_function', ' Partner # -->' + i_partner);

		var d_ap_bill_from_date = request.getParameter('ap_bill_from_date');
		nlapiLogExecution('DEBUG', 'post_restlet_function', ' AP Bill From Date -->' + d_ap_bill_from_date);

		var d_ap_bill_to_date = request.getParameter('ap_bill_to_date');
		nlapiLogExecution('DEBUG', 'post_restlet_function', ' AP Bill To Date  -->' + d_ap_bill_to_date);

		var d_ap_product_from_date = request.getParameter('ap_product_from_date');
		nlapiLogExecution('DEBUG', 'post_restlet_function', ' AP Product From Date -->' + d_ap_product_from_date);

		var d_ap_product_to_date = request.getParameter('ap_product_to_date');
		nlapiLogExecution('DEBUG', 'post_restlet_function', ' AP Product To Date -->' + d_ap_product_to_date);

		var d_product_reconcilliation_data_param = request.getParameter('product_reconcilliation_parameter');
		nlapiLogExecution('DEBUG', 'post_restlet_function', ' Product Reconcilliation Param -->' + d_product_reconcilliation_data_param);

		if (f_partner != true) {
			if (_logValidation(i_partner)) {
				i_user = i_partner;
			}
			if (!_logValidation(i_partner)) {
				i_user = '';
				s_full_access = false;
			}
		}
		if (f_partner == true) {
			i_partner = i_user;
		}

		if (d_product_reconcilliation_data_param == 'PRODUCT_RECONCILLIATION_DATA') {
			var i_PRD_ID = get_Record(i_partner);
			nlapiLogExecution('DEBUG', 'submitted_id ap order ', 'Product Reconcilliation Data -->' + i_PRD_ID);

			if (_logValidation(i_PRD_ID)) {
				remove_product_reconcilliation_data(i_PRD_ID);
			}
		} //Product Reconcilliation Data Param

		if (!_logValidation(d_ap_bill_from_date)) {
			d_ap_bill_from_date = '';
		}
		if (!_logValidation(d_ap_bill_to_date)) {
			d_ap_bill_to_date = '';
		}
		if (!_logValidation(d_ap_product_from_date)) {
			d_ap_product_from_date = '';
		}
		if (!_logValidation(d_ap_product_to_date)) {
			d_ap_product_to_date = '';
		}

		d_ap_bill_from_date = replace_zero(d_ap_bill_from_date);
		d_ap_bill_to_date = replace_zero(d_ap_bill_to_date);

		if (_logValidation(d_ap_bill_from_date)) {
			d_ap_bill_from_date = nlapiStringToDate(d_ap_bill_from_date);
			d_ap_bill_from_date = nlapiDateToString(d_ap_bill_from_date);
		}
		if (_logValidation(d_ap_bill_to_date)) {
			d_ap_bill_to_date = nlapiStringToDate(d_ap_bill_to_date);
			d_ap_bill_to_date = nlapiDateToString(d_ap_bill_to_date);
		}
		if (_logValidation(d_ap_product_from_date)) {
			d_ap_product_from_date = nlapiStringToDate(d_ap_product_from_date);
			d_ap_product_from_date = nlapiDateToString(d_ap_product_from_date);
		}
		if (_logValidation(d_ap_product_to_date)) {
			d_ap_product_to_date = nlapiStringToDate(d_ap_product_to_date);
			d_ap_product_to_date = nlapiDateToString(d_ap_product_to_date);
		}

		var form = nlapiCreateForm('Product Reconcilliation');
		form.setScript('customscript_cli_product_reconcilliation');

		// ============== PRODUCT RECONCILLIATION PAGE PARAMS ===============

		var a_product_reconcilliation_array = get_product_reconcilliation_page_parameters();
		var i_unauthorized_item = a_product_reconcilliation_array[0].unauthorized_item;

		// ============== PRODUCT RECONCILIATION MAPPINGS ================

		var a_product_mappings_array = '';

		var columns = new Array();
		var a_filters = new Array();

		if (_logValidation(i_user)) {
			columns[0] = new nlobjSearchColumn('internalid');
			columns[1] = new nlobjSearchColumn('custrecord_apbill_approduct_mappings');
			columns[2] = new nlobjSearchColumn('custrecord_unmatching_csv_file');
			a_filters[0] = new nlobjSearchFilter('custrecord_partner_user', null, 'is', i_user);
			var a_unmatching_File = '';
			var a_search_results = nlapiSearchRecord('customrecord_pr_mappings', null, a_filters, columns);

			if (_logValidation(a_search_results)) {
				var i_pr_mappings_ID = a_search_results[0].getValue('internalid');
				a_product_mappings_array = a_search_results[0].getValue('custrecord_apbill_approduct_mappings');
				a_unmatching_File = a_search_results[0].getValue('custrecord_unmatching_csv_file');
				// if(_logValidation(i_pr_mappings_ID))
				// {
				// 	var o_PR_OBJ = nlapiLoadRecord('customrecord_pr_mappings',i_pr_mappings_ID);

				// 	if(_logValidation(o_PR_OBJ))
				// 	{
				// 		var a_bill_order_mappings_array = o_PR_OBJ.getFieldValue('custrecord_apbill_approduct_mappings');
				// 		// nlapiLogExecution('DEBUG', 'schedulerFunction',' Bill Order Mappings Array ['+i+'] --->' +a_bill_order_mappings_array);
						
				// 		var getUnmatch_File = o_PR_OBJ.getFieldValue('custrecord_unmatching_csv_file');
				// 		nlapiLogExecution('DEBUG', 'schedulerFunction',' custrecord_unmatching_csv_file ' +getUnmatch_File);
						
				// 		 if(_logValidation(a_bill_order_mappings_array))
				// 		 {
				// 			var a_TT_array_values2 = new Array();	
				// 			 var i_data_TT = new Array();
				// 			 i_data_TT =  a_bill_order_mappings_array;
							 
				// 			 if(_logValidation(i_data_TT))
				// 			 {		  
				// 			      for(var dt=0;dt<i_data_TT.length;dt++)
				// 				  {
				// 					 	a_TT_array_values2 = i_data_TT.split('][');
				// 					    break;				
				// 				  }						
				// 			 }//Data TT	
							 
				// 			 // nlapiLogExecution('DEBUG', 'schedulerFunction',' TT Array Values --->' +a_TT_array_values);	 		    	
				// 			 // nlapiLogExecution('DEBUG', 'schedulerFunction',' TT Array Values Length ['+i+'] --->' +a_TT_array_values.length);
						    		    			
				// 			  if(_logValidation(a_TT_array_values2))
				// 			  {
				// 				  var a_recon_array = new Array();
								  
				// 					   for(var t_x = 0 ; t_x<a_TT_array_values2.length ;t_x++)
				// 					   {
				// 					      var a_reconcile_array = a_TT_array_values2[t_x];
				// 					      nlapiLogExecution('DEBUG', 'schedulerFunction','Reconcile Array ['+t_x+ '] -->' +a_reconcile_array);
									   
				// 					      if(_logValidation(a_reconcile_array))
				// 				    	  {
				// 				    	    var a_split_rec_array = new Array();
								    	    
				// 				    	    a_split_rec_array = a_reconcile_array.split('|');
								    	    
				// 				    	    var i_bill_1_G     = a_split_rec_array[0];    					    	  
				// 				    	    var i_bill_2_G = a_split_rec_array[1];
								    	    
				// 				    	    i_bill_1_G = i_bill_1_G.replace(/[^0-9]/g, "");	 
				// 				    	    i_bill_2_G = i_bill_2_G.replace(/[^0-9]/g, "");
								    		 
				// 				    	    var f_is_bill_fully_reconciled = is_AP_Bill_fully_reconciled(i_bill_1_G);   
				// 				    	    var f_is_product_fully_reconciled  = is_AP_Product_Order_fully_reconciled(i_bill_2_G);
								    	    
								    	    
				// 				    	    nlapiLogExecution('DEBUG', 'schedulerFunction','AP BIll ['+t_x+ '] -->' +i_bill_1_G +' is fully reconciled ? '+f_is_bill_fully_reconciled);
				// 				    	    nlapiLogExecution('DEBUG', 'schedulerFunction','AP Product Order ['+t_x+ '] -->' +i_bill_2_G+' is fully reconciled ?'+f_is_product_fully_reconciled);
										   
				// 				    	    if(f_is_bill_fully_reconciled == true && f_is_product_fully_reconciled == true)
				// 			    	    	{
				// 				    	    	var s_str = '['+i_bill_1_G +'|'+ i_bill_2_G+']'
								    	    	    					    	    	
				// 				    	    	a_recon_array.push(s_str);
				// 			    	    	}    					   
				// 				    	  }
				// 					     }
				// 				        }
							  
							  
				// 			   	 nlapiLogExecution('DEBUG', 'schedulerFunction','****************  Reconcile Array **************** -->' +a_recon_array);
								  
				// 		    	 if(_logValidation(a_recon_array))
				// 	    		 {
				// 	    		   for(var rc = 0 ;rc<a_recon_array.length ; rc++)
				// 				   {
				// 				     var s_str = a_recon_array[rc];
								     
				// 				     a_bill_order_mappings_array = a_bill_order_mappings_array.replace(s_str, '');
								 	
				// 				   }
				// 	    		   nlapiLogExecution('DEBUG', 'schedulerFunction','****************  a_bill_order_mappings_array **************** -->' +a_bill_order_mappings_array);
									
				// 	    		 }		    	     
						    	 
						    	 
				// 		    	 // CODE TO REMOVE FULLY RECONCILED MAPPING FROM UNPATCH FILE 
				// 		    	 var s_unmatch_content = '';
				// 		    	 var a_recon_array_ = new Array()
				// 		    	 if(_logValidation(getUnmatch_File))
				// 		    	 {
				// 		    		 nlapiLogExecution('DEBUG', 'schedulerFunction','******* START getUnmatch_File ' +getUnmatch_File);
						    		
				// 		    		 // GET THE UNMATCHED FILE DATA 
				// 		    		 var Obj_file = nlapiLoadFile(getUnmatch_File);
				// 		  		     var s_unmatch_content_string = Obj_file.getValue();
				// 		  		     s_unmatch_content = s_unmatch_content_string.toString(); 
				// 		  		     nlapiLogExecution('DEBUG', 'schedulerFunction','******* START s_unmatch_content ' +s_unmatch_content);
				// 		  		     if(_logValidation(s_unmatch_content))
				// 	  		    	 {
				// 		  		    	 var s_unmatch_content_splitter = s_unmatch_content.toString().split('][');
				// 		  		    	nlapiLogExecution('DEBUG', 'schedulerFunction','******* START s_unmatch_content_splitter ' +s_unmatch_content_splitter);
				// 		  		    	nlapiLogExecution('DEBUG', 'schedulerFunction','******* START s_unmatch_content_splitter length ' +s_unmatch_content_splitter.length);
						  		    	
				// 		  		    	 for(var i_unmatch=0;i_unmatch < s_unmatch_content_splitter.length; i_unmatch++)
				// 	  		    	     {
				// 		  		    		 var s_unmatch = s_unmatch_content_splitter[i_unmatch] ;
				// 		  		    		 var g_unmatch = s_unmatch; 
				// 		  		    		 g_unmatch = g_unmatch.replace('[', "");
				// 		  		    		 g_unmatch = g_unmatch.replace(']', "");
				// 		  		    		 s_unmatch = s_unmatch.toString().split('|');
				// 								 var i_AP_bill = s_unmatch[0];
				// 								 var i_AP_Order = s_unmatch[6];
				// 								i_AP_bill = i_AP_bill.replace(/[^0-9]/g, "");	 
				// 								i_AP_Order = i_AP_Order.replace(/[^0-9]/g, "");

				// 								 var f_is_bill_fully_reconciled_ = is_AP_Bill_fully_reconciled(i_AP_bill);   
				// 					    	     var f_is_product_fully_reconciled_  = is_AP_Product_Order_fully_reconciled(i_AP_Order);
				// 					    	    //nlapiLogExecution('DEBUG', 'schedulerFunction','******* START f_is_bill_fully_reconciled_ ' +f_is_bill_fully_reconciled_);
				// 			  		    	//nlapiLogExecution('DEBUG', 'schedulerFunction','******* START f_is_product_fully_reconciled_ ' +f_is_product_fully_reconciled_);
							  		    	
				// 					    	     // CHECK IF THE AP BILL AND AP ORDER ARE FULLY MAPPED 
				// 					    	     if(f_is_bill_fully_reconciled_ == true && f_is_product_fully_reconciled_ == true)
				// 			    	    	 {
				// 				    	    	var s_str = '['+g_unmatch+']';
				// 				    	    	a_recon_array_.push(s_str);
				// 			    	    	 }
				// 	  		    	     } // END OF FOR LOOP 
				// 	  		    	 } // END OF   if(_logValidation(s_unmatch_content))
						  		     
						  		     
						  		     
						  		     
						  		     
				// 		    	 } // END OF  if(_logValidation(getUnmatch_File))
				// 		    	 nlapiLogExecution('DEBUG', 'schedulerFunction','******* START a_recon_array_ TO REPLACE  ' +a_recon_array_);
					  		    
						    	 
				// 		    	 // REPLACE FULLY MAPPED WITH SPACE 
				// 		    	 if(_logValidation(a_recon_array_))
				// 	    		 {
				// 	    		   for(var rc_ = 0 ;rc_<a_recon_array_.length ; rc_++)
				// 				   {
				// 				     var s_str = a_recon_array_[rc_];
				// 				     s_unmatch_content = s_unmatch_content.replace(s_str, '');
								 	
				// 				   }
					    		   
				// 	    		 }
						    	 
				// 		    	 nlapiLogExecution('DEBUG', 'schedulerFunction','******* AFTER REPLACE   a_recon_array_ TO REPLACE  ' +s_unmatch_content);
						  		    
						    	 
				// 		    	 // MAKE NOTEPAD FOR THE REMAINING CONTENT 
				// 		 		//if(_logValidation(s_unmatch_content))
				// 		 		{
				// 		 			var i_user = o_PR_OBJ.getFieldValue('custrecord_partner_user');
				// 	 		    	var s_file_name = 'Unmatched AP Bill and Product Order_'+i_user+'.txt'					
				// 	 				var file_obj = nlapiCreateFile(s_file_name, 'PLAINTEXT', s_unmatch_content.toString());
				// 	 				file_obj.setFolder(1765674);
				// 	 				var file_ID =  nlapiSubmitFile(file_obj);
				// 	 				nlapiLogExecution('DEBUG', 'post_restlet_function', ' file_ID -->'+file_ID);
				// 	 			    o_PR_OBJ.setFieldValue('custrecord_unmatching_csv_file',file_ID);
					 				
				// 		 		}
						    	 
				// 		    	// if(_logValidation(a_bill_order_mappings_array))
				// 	    		 {
				// 	    		    o_PR_OBJ.setFieldValue('custrecord_apbill_approduct_mappings',a_bill_order_mappings_array);
				// 	    		 }
						    	
				// 		    	 var i_submitID = nlapiSubmitRecord(o_PR_OBJ,true,true);
				// 		    	 nlapiLogExecution('DEBUG', 'schedulerFunction','**************** Product Reconcilliation Mappings ID **************** -->'+i_submitID);
								
							  
				// 				} //Bill Mappings Array  
						 
						
				// 	}//PR OBJ		  
				// }
			} else {
				var o_product_mappingsOBJ = nlapiCreateRecord('customrecord_pr_mappings', {
					recordmode: 'dynamic'
				});
				o_product_mappingsOBJ.setFieldValue('custrecord_apbill_approduct_mappings', '');
				o_product_mappingsOBJ.setFieldValue('custrecord_partner_user', i_user);
				o_product_mappingsOBJ.setFieldValue('custrecord_unmatching_csv_file', '');
				var i_submit_product_mappingsID = nlapiSubmitRecord(o_product_mappingsOBJ, true, true);
				nlapiLogExecution('DEBUG', 'post_restlet_function', ' ------ Product Reconcilliation Mappings Submit ID {CREATE}-->' + i_submit_product_mappingsID);
			}
		}


		nlapiLogExecution('DEBUG', 'post_restlet_function', ' a_unmatching_File -->' + a_unmatching_File);

		var filters_1 = new Array();
		if (_logValidation(i_partner) && !_logValidation(d_ap_bill_from_date) && !_logValidation(d_ap_bill_to_date)) {
			var filters_1 = [
				["custrecord_ap_stock_line_stock_receipt.custrecord_ap_franchisee", "anyof", i_partner]
			]
		} else if (_logValidation(d_ap_bill_from_date) && _logValidation(d_ap_bill_to_date) && _logValidation(i_partner)) {
			var filters_1 = [
				[
					[
						["custrecord_ap_stock_line_stock_receipt.custrecord_ap_bill_date", "within", [d_ap_bill_from_date, d_ap_bill_to_date]], "AND", ["custrecord_ap_stock_line_stock_receipt.custrecord_ap_franchisee", "anyof", i_partner]
					], "OR", [
						["custrecord_ap_stock_line_stock_receipt.custrecord_ap_s_color", "is", "1"], "AND", ["custrecord_ap_stock_line_stock_receipt.custrecord_ap_stock_recon_status", "noneof", "1"]
					], "AND", ["custrecord_ap_stock_line_stock_receipt.custrecord_ap_franchisee", "anyof", i_partner]
				]
			]
		} else if (_logValidation(d_ap_bill_from_date) && _logValidation(d_ap_bill_to_date) && !_logValidation(i_partner)) {
			var filters_1 = [
				[
					[
						["custrecord_ap_stock_line_stock_receipt.custrecord_ap_bill_date", "within", [d_ap_bill_from_date, d_ap_bill_to_date]], "OR", [
							["custrecord_ap_stock_line_stock_receipt.custrecord_ap_s_color", "is", "1"], "AND", ["custrecord_ap_stock_line_stock_receipt.custrecord_ap_stock_recon_status", "noneof", "1"]
						]
					]
				]
			]
		}
		// ========== SEARCH AP PRODUCT ORDER ============

		var a_search_results_1 = nlapiSearchRecord(null, 'customsearch_ap_recon_page_line_bills', filters_1, null);

		var i_name_1 = '';
		var i_item_1 = '';
		var i_quantity_1 = 0;
		var i_customer_1 = '';
		var i_ID_1 = '';
		var strVar_1 = "";
		var i_unreconciled_quantity_1 = "";
		var i_AP_line_item_ID_1 = "";
		var i_item_1_txt = '';
		var s_corporate_po_1 = '';
		var d_date_1 = '';
		var i_assignment_no_1 = '';
		var s_status_1 = '';
		var a_bill_array_1 = new Array();
		var a_data_array_1 = new Array();
		var a_bill_no_display_array_1 = new Array();
		var s_description_1 = '';
		var i_no_of_days = 0;
		var i_reconcilliation_status_1 = '';
		var i_unreconciled_quantity_1 = 0;
		var a_compare_array_2 = new Array();
		var a_compare_array_1 = new Array();
		var i_matching_done_1 = 'F';
		var a_bill_occurences_1 = new Array();
		var a_bill_occurences_2 = new Array();
		var i_reconciliation_status_1 = '';
		var i_reconciliation_status_text_1 = '';
		var i_offsetting_AP_Bill_ID_1 = '';
		var i_offsetting_product_order_ID_1 = '';
		var a_green_array_1 = new Array();
		var a_green_array_2 = new Array();
		var a_orange_array_1 = new Array();
		var a_orange_array_2 = new Array();
		var a_white_array_1 = new Array();
		var a_white_array_2 = new Array();
		var i_status_1 = '';
		var i_status_text_1 = '';
		var i_recon_status_1 = '';
		var i_reconciled_AP_Bill_1 = '';
		var i_reconciled_AP_Product_Order_1 = '';
		var a_bill_temp = '';
		var s_quantity_wise_mapping_1 = '';
		var previouse_ID = '';
		var previouse_Status = '';
		var i_bill_amount = 0;

		if (_logValidation(a_search_results_1) && s_full_access == true) {
			nlapiLogExecution('DEBUG', 'suiteletFunction', 'AP Product Order Search Results Length -->' + a_search_results_1.length);

			for (var i in a_search_results_1) {
				var a_results_1 = a_search_results_1[i];
				var columns_1 = a_results_1.getAllColumns();

				for (var n in columns_1) {
					var column_1 = columns_1[n];
					var label_1 = column_1.getLabel();
					var formula_1 = column_1.getFormula();
					var functionName_1 = column_1.getFunction();
					var value_1 = a_results_1.getValue(column_1);
					var text_1 = a_results_1.getText(column_1);

					if (label_1 == 'AP Bill Internal ID') {
						i_ID_1 = value_1;
					}

					if (label_1 == 'AP Item') {
						i_item_1_txt = text_1;
						i_item_1 = value_1;
					}
					if (label_1 == 'Actual Quantity') {
						i_quantity_1 = value_1;
					}
					if (label_1 == 'Internal ID') {
						i_AP_line_item_ID_1 = value_1;
					}
					if (label_1 == 'Corporate PO') {
						s_corporate_po_1 = text_1; // 6 Jan 2016
					}
					if (label_1 == 'Date') {
						d_date_1 = value_1;
					}
					if (label_1 == 'Assignment No') {
						i_assignment_no_1 = value_1;
					}
					if (label_1 == 'Status') {
						s_status_1 = value_1;
					}
					if (label_1 == 'Description') {
						s_description_1 = value_1;
					}
					if (label_1 == 'No Of Days') {
						i_no_of_days = value_1;
					}
					if (label_1 == 'Status') {
						i_status_1 = value_1;
						i_status_text_1 = text_1;
					}
					if (label_1 == 'Unreconcilled Quantity Final') {
						i_unreconciled_quantity_1 = value_1;
					}
					if (label_1 == 'Matching Done') {
						i_matching_done_1 = value_1;
					}
					if (label_1 == 'Reconcilliation Status') {
						i_reconciliation_status_1 = value_1;
						i_reconciliation_status_text_1 = text_1;

					}
					if (label_1 == 'Offsetting AP Bill ID') {
						i_offsetting_AP_Bill_ID_1 = value_1;
					}
					if (label_1 == 'Offsetting Product Order ID') {
						i_offsetting_product_order_ID_1 = value_1;
					}
					if (label_1 == 'Mapping Status') {
						i_recon_status_1 = value_1;
					}
					if (label_1 == 'Reconciled AP Bill') {
						i_reconciled_AP_Bill_1 = value_1;
					}
					if (label_1 == 'Reconciled AP Product Order') {
						i_reconciled_AP_Product_Order_1 = value_1;
					}
					if (label_1 == 'Quantity Wise Mappings') {
						s_quantity_wise_mapping_1 = value_1;
					}
					if (label_1 == 'Bill Amount') {
						i_bill_amount = value_1;
					}
				}

				// ADDED CODE FOR CONFIRM BUTTON 
				if (i_item_1_txt == 'Unauthorised Product Range') {
					if (_logValidation(a_unauthorised_array)) {
						if (i_matching_done_1 == 'T') {
							a_unauthorised_array = a_unauthorised_array + ',' + i_ID_1 + '|' + i_item_1_txt + '|' + i_unreconciled_quantity_1;
						} else {
							a_unauthorised_array = a_unauthorised_array + ',' + i_ID_1 + '|' + i_item_1_txt + '|' + i_quantity_1;
						}
					} else {
						if (i_matching_done_1 == 'T') {
							a_unauthorised_array = i_ID_1 + '|' + i_item_1_txt + '|' + i_unreconciled_quantity_1;
						} else {
							a_unauthorised_array = i_ID_1 + '|' + i_item_1_txt + '|' + i_quantity_1;
						}
					}
				}
				if (_logValidation(s_quantity_wise_mapping_1)) {
					a_GLOBAL_unmatch_array.push(s_quantity_wise_mapping_1);
				}
				var a_PRODUCT_array_values = new Array();
				var i_data_TT = new Array();
				i_data_TT = i_reconciled_AP_Product_Order_1;

				if (_logValidation(i_data_TT)) {
					for (var dt = 0; dt < i_data_TT.length; dt++) {
						a_PRODUCT_array_values = i_data_TT.split(',');
						break;
					}
					a_product_mapping_OVERALL_array.push(a_PRODUCT_array_values);
				} //Data TT				 
				if (a_bill_temp != i_ID_1) {
					a_bill_temp = i_ID_1;
					var a_product_combine_array = new Array();
				}
				if (i_ID_1 == a_bill_temp) {
					if (_logValidation(a_PRODUCT_array_values)) {
						for (var b_z = 0; b_z < a_PRODUCT_array_values.length; b_z++) {
							a_product_combine_array.push(a_PRODUCT_array_values[b_z]);
						}
					}
				}
				a_product_combine_array = remove_duplicates(a_product_combine_array);

				if ((i_reconciliation_status_1 == 1 || i_recon_status_1 == 1) || ((i_item_1 == i_unauthorized_item) && (i_unreconciled_quantity_1 == 0) && (i_matching_done_1 == 'T'))) {
					a_green_array_1.push(i_ID_1);
				}
				var f_is_green = a_green_array_1.indexOf(i_ID_1);
				if (i_item_1 == i_unauthorized_item && previouse_ID == i_ID_1 && f_is_green > -1 && (previouse_Status != 'Fully Reconciled' || (i_reconciliation_status_text_1 != 'Fully Reconciled' && i_reconciliation_status_text_1 != 'Authorized'))) {
					a_orange_array_1.push(i_ID_1);
				}
				// IF THE PREVOIUSE ALL ITEM ARE FULLY RECONCILED AND AND CURRENT ITEM IS UNAUTHORIZED THEN IT SHOULD BE IN ORANGE 
				if (i_item_1 == i_unauthorized_item && previouse_ID == i_ID_1 && f_is_green > -1 && i_reconciliation_status_text_1 == 'Unauthorized') {
					a_orange_array_1.push(i_ID_1);
				}


				if (((i_reconciliation_status_1 == 2) || ((i_unreconciled_quantity_1 != 0) && (i_unreconciled_quantity_1 != '') && (i_quantity_1 != i_unreconciled_quantity_1))) || ((i_item_1 == i_unauthorized_item) && (i_unreconciled_quantity_1 != 0) && (i_matching_done_1 == 'T'))) {
					a_orange_array_1.push(i_ID_1);
				}
				if (i_matching_done_1 != 'T') {
					a_white_array_1.push(i_ID_1);
				}


				var s_compare_str_1 = '';
				a_bill_array_1.push(i_ID_1);
				a_bill_occurences_1.push(i_ID_1);

				a_bill_no_display_array_1[i_ID_1] = {
					'bill_no': i_ID_1,
					'assignment_no': i_assignment_no_1,
					'corporate_po': s_corporate_po_1,
					'date': d_date_1,
					'description': s_description_1,
					'status': i_status_1,
					'statustext': i_status_text_1,
					'productarray': a_product_combine_array,
					'bill_amount': i_bill_amount
				};

				// MAKE STRING FOR SCROLL CLASS IN BILL ORDER 
				if (previouse_ID == '' && _logValidation(i_ID_1) && _logValidation(i_assignment_no_1)) {
					var data_x = i_ID_1 + '@@@' + i_assignment_no_1;

					var result_w = a_Bill_Array_scroll.indexOf(data_x);

					if (result_w == -1) {
						a_Bill_Array_scroll = i_ID_1 + '@@@' + i_assignment_no_1;
					}


					// a_Bill_Array_scroll  = i_ID_1 + '@@@'+ i_assignment_no_1 ;
				} else if (pre_green_Value != i_ID_1 && _logValidation(i_ID_1) && _logValidation(i_assignment_no_1)) {

					var data_x = i_ID_1 + '@@@' + i_assignment_no_1;

					var result_w = a_Bill_Array_scroll.indexOf(data_x);

					if (result_w == -1) {
						a_Bill_Array_scroll = a_Bill_Array_scroll + '####' + i_ID_1 + '@@@' + i_assignment_no_1;
					}

					//a_Bill_Array_scroll  =  a_Bill_Array_scroll + '####' +  i_ID_1 + '@@@'+ i_assignment_no_1 ;
				}
				a_data_array_1[i] = i_ID_1 + '@@&!!&@@' + s_compare_str_1 + '@@&!!&@@' + i_item_1_txt + '@@&!!&@@' + i_quantity_1 + '@@&!!&@@' + i_AP_line_item_ID_1 + '@@&!!&@@' + s_corporate_po_1 + '@@&!!&@@' + d_date_1 + '@@&!!&@@' + i_assignment_no_1 + '@@&!!&@@' + s_status_1 + '@@&!!&@@' + s_description_1 + '@@&!!&@@' + i_item_1 + '@@&!!&@@' + i_no_of_days + '@@&!!&@@' + i_unreconciled_quantity_1 + '@@&!!&@@' + i_matching_done_1 + '@@&!!&@@' + i_reconciliation_status_1 + '@@&!!&@@' + i_offsetting_AP_Bill_ID_1 + '@@&!!&@@' + i_offsetting_product_order_ID_1 + '@@&!!&@@' + a_PRODUCT_array_values + '@@&!!&@@' + s_quantity_wise_mapping_1;
				a_compare_array_1[i_ID_1] = {
					'bill_no': i_ID_1,
					'item': i_item_1_txt,
					'quantity': i_quantity_1,
					'unreconciledquantity': i_unreconciled_quantity_1
				};
				previouse_ID = i_ID_1;
				previouse_Status = i_reconciliation_status_text_1;
			} //Loop Search Results	
		} //If Search Results		 			    
		a_bill_array_1 = remove_duplicates(a_bill_array_1);
		a_data_array_1 = remove_duplicates(a_data_array_1);
		a_orange_array_1 = remove_duplicates(a_orange_array_1);
		a_green_array_1 = remove_duplicates(a_green_array_1);
		a_white_array_1 = remove_duplicates(a_white_array_1);

		var line_2 = 0;
		// ================ Search - MP - AP Product Order Search ==================

		var filters_2 = new Array();

		if (_logValidation(i_partner) && !_logValidation(d_ap_product_from_date) && !_logValidation(d_ap_product_to_date)) {
			var filters_2 = [
				["custrecord_ap_product_order.custrecord_mp_ap_order_franchisee", "anyof", i_partner]

			]
		}
		if (_logValidation(i_partner) && _logValidation(d_ap_product_from_date) && _logValidation(d_ap_product_to_date)) {
			var filters_2 = [
				[
					[
						["custrecord_ap_product_order.custrecord_mp_ap_order_date", "within", [d_ap_product_from_date, d_ap_product_to_date]], "AND", ["custrecord_ap_product_order.custrecord_mp_ap_order_franchisee", "anyof", i_partner]
					], "OR", [
						["custrecord_ap_product_order.custrecord_ap_p_color", "is", "1"], "AND", ["custrecord_ap_product_order.custrecord_ap_order_recon_status", "noneof", "1"]
					], "AND", ["custrecord_ap_product_order.custrecord_mp_ap_order_franchisee", "anyof", i_partner]
				]

			]
		}
		if (!_logValidation(i_partner) && _logValidation(d_ap_product_from_date) && _logValidation(d_ap_product_to_date)) {
			var filters_2 = [
				[
					[
						["custrecord_ap_product_order.custrecord_mp_ap_order_date", "within", [d_ap_product_from_date, d_ap_product_to_date]], "OR", [
							["custrecord_ap_product_order.custrecord_ap_p_color", "is", "1"], "AND", ["custrecord_ap_product_order.custrecord_ap_order_recon_status", "noneof", "1"]
						]
					]
				]

			]
		}

		var a_search_results_2 = nlapiSearchRecord(null, 'customsearch_ap_recon_page_line_orders', filters_2, null);

		var i_name_2 = '';
		var i_item_2 = '';
		var i_item_2_txt = '';
		var i_quantity_2 = 0;
		var i_customer_2 = '';
		var i_AP_line_item_ID_2 = '';
		var i_ID_2 = '';
		var strVar_2 = "";
		var a_bill_array_2 = new Array();
		var a_data_array_2 = new Array();
		var a_bill_no_display_array_2 = new Array();
		var i_customer_2 = '';
		var d_order_date_2 = '';
		var i_AP_Line_Item_2 = '';
		var i_reconcilliation_status_2 = '';
		var i_unreconciled_quantity_2 = 0;
		var i_previous = '';
		var i_matching_done_2 = 'F';
		var i_reconciliation_status_text_2 = '';
		var i_offsetting_AP_Bill_ID_2 = '';
		var i_offsetting_product_order_ID_2 = '';
		var i_status_2 = '';
		var i_status_text_2 = '';
		var i_no_of_days_2 = 0;
		var i_recon_status_2 = '';
		var i_reconciled_AP_Bill_2 = '';
		var i_reconciled_AP_Product_Order_2 = '';
		var a_product_temp = '';
		var pre_green_Value = '';
		var previouse_Status_ap = '';
		var i_product_order_amount = 0;
		var i_customer_id_2 = '';
		var f_commission = '';
		if (_logValidation(a_search_results_2) && s_full_access == true) {
			nlapiLogExecution('DEBUG', 'post_restlet_function', ' AP Product Order -->' + a_search_results_2.length);

			for (var t in a_search_results_2) {
				var a_results_2 = a_search_results_2[t];
				var columns_2 = a_results_2.getAllColumns();

				for (var n in columns_2) {
					var column_2 = columns_2[n];
					var label_2 = column_2.getLabel();
					var formula_2 = column_2.getFormula();
					var functionName_2 = column_2.getFunction();
					var value_2 = a_results_2.getValue(column_2);
					var text_2 = a_results_2.getText(column_2);

					if (label_2 == 'AP Order Internal ID') {
						i_ID_2 = value_2;
					}
					if (label_2 == 'AP Item') {
						i_item_2 = value_2;
						i_item_2_txt = text_2
					}
					if (label_2 == 'Actual Quantity') {
						i_quantity_2 = value_2;
					}
					if (label_2 == 'Internal ID') {
						i_AP_line_item_ID_2 = value_2;
					}
					if (label_2 == 'Order Date') {
						d_order_date_2 = value_2;
					}
					if (label_2 == 'Customer') {
						i_customer_2 = text_2;
						i_customer_id_2 = value_2;
					}
					if (label_2 == 'Status') {
						i_status_2 = value_2;
						i_status_text_2 = text_2;
					}
					if (label_2 == 'Unreconcilled Quantity Final') {
						i_unreconciled_quantity_2 = value_2;
					}
					if (label_2 == 'Matching Done') {
						i_matching_done_2 = value_2;
					}
					if (label_2 == 'Offsetting Product Order ID') {
						i_offsetting_product_order_ID_2 = value_2;
					}
					if (label_2 == 'Offsetting AP Bill ID') {
						i_offsetting_AP_Bill_ID_2 = value_2;
					}
					if (label_2 == 'Reconcilliation Status') {
						i_reconcilliation_status_2 = value_2;
						i_reconciliation_status_text_2 = text_2;

					}
					if (label_2 == 'No Of Days') {
						i_no_of_days_2 = value_2;
					}
					if (label_2 == 'Mapping Status') {
						i_recon_status_2 = value_2;
					}
					if (label_2 == 'Reconciled AP Bill') {
						i_reconciled_AP_Bill_2 = value_2;
					}
					if (label_2 == 'Reconciled AP Product Order') {
						i_reconciled_AP_Product_Order_2 = value_2;
					}
					if (label_2 == 'Product Order Amount') {
						i_product_order_amount = value_2;
					}

					if (label_2 == 'Product Order Amount') {
						i_product_order_amount = value_2;
					}
					if (label_2 == 'Expected Franchisee Commissions') {
						f_commission = value_2;
					}
				}



				// MAKE GREEN ARRAY FOR SECOND TABLE
				if ((i_reconcilliation_status_2 == 1 || i_recon_status_2 == 1) || ((i_item_2 == i_unauthorized_item) && (i_unreconciled_quantity_2 == 0) && (i_matching_done_2 == 'T'))) {
					a_green_array_2.push(i_ID_2);
				}

				var f_is_green = a_green_array_2.indexOf(i_ID_2);
				if (pre_green_Value == i_ID_2 && f_is_green > -1 && (previouse_Status_ap != 'Fully Reconciled' || i_reconciliation_status_text_2 != 'Fully Reconciled')) {
					a_orange_array_2.push(i_ID_2);
				}
				if (((i_reconcilliation_status_2 == 2) || ((i_unreconciled_quantity_2 != 0) && (i_quantity_2 != i_unreconciled_quantity_2) && (i_status_2 != 7 && i_quantity_2 > 0) && (i_reconcilliation_status_2 != 1))) || ((i_item_2 == i_unauthorized_item) && (i_unreconciled_quantity_2 != 0) && (i_matching_done_2 == 'T')))
				// if((()|| (() && () &&() &&()))|| (() && () && ()))
				//if(((i_reconcilliation_status_2 == 2)|| ((i_unreconciled_quantity_2!=0) && (i_quantity_2 != i_unreconciled_quantity_2) &&(i_status_2!=7 && i_quantity_2>0) &&(i_reconcilliation_status_2!=1)|| (f_is_green == -1 && (i_reconcilliation_status_2!=1))))|| ((i_item_2 == i_unauthorized_item) && (i_unreconciled_quantity_2 != 0) && (i_matching_done_2 == 'T')))
				{
					a_orange_array_2.push(i_ID_2);
				}
				var a_BILL_array_values = new Array();
				var i_data_TT = new Array();
				i_data_TT = i_reconciled_AP_Bill_2;

				if (_logValidation(i_data_TT)) {
					for (var dt = 0; dt < i_data_TT.length; dt++) {
						a_BILL_array_values = i_data_TT.split(',');
						break;
					}
					a_bill_mapping_OVERALL_array.push(a_BILL_array_values);
				} //Data TT					 
				if (a_product_temp != i_ID_2) {
					a_product_temp = i_ID_2;
					var a_bill_combine_array = new Array();
				}
				if (i_ID_2 == a_product_temp) {
					if (_logValidation(a_BILL_array_values)) {
						for (var p_z = 0; p_z < a_BILL_array_values.length; p_z++) {
							a_bill_combine_array.push(a_BILL_array_values[p_z]);
						}
						//a_bill_combine_array.push(a_BILL_array_values);
					}
				}
				a_bill_combine_array = remove_duplicates(a_bill_combine_array);

				if (_logValidation(i_customer_2)) {
					i_customer_2 = i_customer_2.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
				}

				// MAKE STRING FOR SCROLL CLASS IN BILL 
				if (i_status_2 != 1 && pre_green_Value == '' && _logValidation(i_ID_2) && _logValidation(i_customer_2) && _logValidation(d_order_date_2)) {

					var data_x = i_ID_2;

					var result_w = a_AP_Order_Array_scroll_temp.indexOf(data_x);

					if (result_w == -1) {
						a_AP_Order_Array_scroll = i_ID_2 + '@@@' + i_customer_2 + '@@@' + d_order_date_2;
						a_AP_Order_Array_scroll_temp = i_ID_2;
					}

					// a_AP_Order_Array_scroll  = i_ID_2 + '@@@'+ i_customer_2 +'@@@'+ d_order_date_2 ;
				} else
				if (i_status_2 != 1 && pre_green_Value != i_ID_2 && _logValidation(i_ID_2) && _logValidation(s_corporate_po_1) && _logValidation(d_date_1)) {
					var data_x = i_ID_2;

					var result_w = a_AP_Order_Array_scroll_temp.indexOf(data_x);

					if (result_w == -1) {
						a_AP_Order_Array_scroll_temp = a_AP_Order_Array_scroll_temp + '####' + i_ID_2;
						a_AP_Order_Array_scroll = a_AP_Order_Array_scroll + '####' + i_ID_2 + '@@@' + i_customer_2 + '@@@' + d_order_date_2;
						// a_AP_Order_Array_scroll  = a_AP_Order_Array_scroll + '####' +i_ID_2 + '@@@'+ i_customer_2 +'@@@'+ d_order_date_2 ;
					}
					//	 a_AP_Order_Array_scroll  =  a_AP_Order_Array_scroll + '####' +  i_ID_2 + '@@@'+ i_customer_2 +'@@@'+ d_order_date_2 ;
				}

				var s_compare_str_2 = '';

				a_bill_array_2.push(i_ID_2);
				a_bill_occurences_2.push(i_ID_2);

				a_bill_no_display_array_2[i_ID_2] = {
					'bill_no': i_ID_2,
					'customer': i_customer_2,
					'order_date': d_order_date_2,
					'status': i_status_2,
					'statustext': i_status_text_2,
					'billarray': a_bill_combine_array,
					'product_order_amount': i_product_order_amount,
					'customer_id': i_customer_id_2,
					'franch_commi': f_commission
				};

				var s_display_txt_2 = i_item_2_txt + ' - ' + i_quantity_2;
				a_data_array_2[t] = i_ID_2 + '@@&!!&@@' + s_compare_str_2 + '@@&!!&@@' + i_item_2_txt + '@@&!!&@@' + i_quantity_2 + '@@&!!&@@' + i_AP_line_item_ID_2 + '@@&!!&@@' + i_item_2 + '@@&!!&@@' + i_unreconciled_quantity_2 + '@@&!!&@@' + i_matching_done_2 + '@@&!!&@@' + i_no_of_days_2 + '@@&!!&@@' + a_BILL_array_values;
				a_compare_array_2[i_ID_2] = {
					'apbill_no': i_AP_line_item_ID_2,
					'item': i_item_2_txt,
					'quantity': i_quantity_2,
					'unreconciledquantity': i_unreconciled_quantity_2
				};
				pre_green_Value = i_ID_2;
				previouse_Status_ap = i_reconciliation_status_text_2;
			} //Loop Search Results	
		} //If Search Results
		a_GLOBAL_unmatch_array = remove_duplicates(a_GLOBAL_unmatch_array);
		a_bill_array_2 = remove_duplicates(a_bill_array_2);
		a_data_array_2 = remove_duplicates(a_data_array_2);
		a_green_array_2 = remove_duplicates(a_green_array_2);
		a_orange_array_2 = remove_duplicates(a_orange_array_2);
		a_product_mapping_OVERALL_array = remove_duplicates(a_product_mapping_OVERALL_array);
		a_bill_mapping_OVERALL_array = remove_duplicates(a_bill_mapping_OVERALL_array);

	// ON BEFORELOAD UNMATCH ARRAY 
		var s_unmatch_content = '';
		var reconcile_Array_before_Load = '';
		var reconcile_Array_before = '';
		var s_unmatch_content_ar = '';
		if (_logValidation(a_unmatching_File)) {
			var Obj_file = nlapiLoadFile(a_unmatching_File);
			var s_unmatch_content_string = Obj_file.getValue();
			s_unmatch_content = s_unmatch_content_string.toString();
			var re = new RegExp('T', 'g');
			s_unmatch_content = s_unmatch_content.toString().replace(re, 'F');
			var s_unmatch_content_splitter = s_unmatch_content.toString().split('][');
			for (var u_ii = 0; u_ii < s_unmatch_content_splitter.length; u_ii++) {
				var s_unmatch_rec_arrayr = s_unmatch_content_splitter[u_ii].split('|');

				if (_logValidation(s_unmatch_rec_arrayr)) {
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

					if(u_ii == 0){
						var iBillID = i_bill_id.split('[');
						i_bill_id = iBillID[1];
					}

					if(u_ii == (s_unmatch_content_splitter.length - 1)){
						var iBillID = s_unmatch_rec_arrayr[12].split(']');
						s_unmatch_rec_arrayr[12] = iBillID[0];
					}

					nlapiLogExecution('DEBUG', 'post_restlet_function', ' i_bill_id -->' + i_bill_id);

					var billArray = a_bill_array_1.toString().split(',');

					var result = billArray.indexOf(i_bill_id);

					if(result == -1){

					} else {
						if (_logValidation(i_bill_unreconcile)) {
							i_bill_unreconcile = parseFloat(i_bill_unreconcile)
						} else {
							i_bill_unreconcile = 0;
						}
						if (_logValidation(i_bill_orifinal)) {
							i_bill_orifinal = parseFloat(i_bill_orifinal)
						} else {
							i_bill_orifinal = 0
						}

						var difference_1 = i_bill_orifinal - i_bill_unreconcile;
						difference_1 = parseFloat(difference_1).toFixed(1);

						if (_logValidation(i_bill_unreconcile_1_)) {
							i_bill_unreconcile_1_ = parseFloat(i_bill_unreconcile_1_)
						}
						if (_logValidation(i_bill_unreconcile)) {
							i_bill_orifinal_1 = parseFloat(i_bill_orifinal_1)
						}

						var difference_2 = i_bill_orifinal_1 - i_bill_unreconcile_1_;
						difference_2 = parseFloat(difference_2).toFixed(1);
						

						if (u_ii == 0 && u_ii == s_unmatch_content_splitter.length - 1) {
							reconcile_Array_before = '['+ i_bill_id + '|' + i_ap_line_id + '|' + difference_1 + '|' + i_ap_line_id_1 + '|' + i_bill_id_1 + '|' + difference_2 + '|F]';
						} else if (u_ii == 0) {
							reconcile_Array_before = '['+ i_bill_id + '|' + i_ap_line_id + '|' + difference_1 + '|' + i_ap_line_id_1 + '|' + i_bill_id_1 + '|' + difference_2 + '|F]';
						} else if (u_ii == s_unmatch_content_splitter.length - 1) {
							reconcile_Array_before = '[' + i_bill_id + '|' + i_ap_line_id + '|' + difference_1 + '|' + i_ap_line_id_1 + '|' + i_bill_id_1 + '|' + difference_2 + '|F]';
						} else {
							reconcile_Array_before = '[' + i_bill_id + '|' + i_ap_line_id + '|' + difference_1 + '|' + i_ap_line_id_1 + '|' + i_bill_id_1 + '|' + difference_2 + '|F]';;
						}



						// ADD BEFORE LOAD STRING TO BEFORE LOAD ARRAY 
						if (reconcile_Array_before_Load == '') {
							reconcile_Array_before_Load = reconcile_Array_before;
						} else {
							reconcile_Array_before_Load = reconcile_Array_before_Load + reconcile_Array_before;
						}

						s_unmatch_content_ar += '[' + i_bill_id + '|' + s_unmatch_rec_arrayr[1] + '|' + s_unmatch_rec_arrayr[2] + '|' + s_unmatch_rec_arrayr[3] + '|' + s_unmatch_rec_arrayr[4] + '|' + s_unmatch_rec_arrayr[5] + '|' + s_unmatch_rec_arrayr[6] + '|' + s_unmatch_rec_arrayr[7] + '|' + s_unmatch_rec_arrayr[8] + '|' + s_unmatch_rec_arrayr[9] + '|' + s_unmatch_rec_arrayr[10] + '|' + s_unmatch_rec_arrayr[11] + '|' + s_unmatch_rec_arrayr[12] + ']';
					}

					
				} // END OF INNR IFF		      
			} // END OF FOR 	 		   
		}

		nlapiLogExecution('DEBUG', 'post_restlet_function', ' reconcile_Array_before_Load -->' + reconcile_Array_before_Load);


		s_unmatch_content = s_unmatch_content_ar;

		nlapiLogExecution('DEBUG', 'a_product_mappings_array', a_product_mappings_array);
		nlapiLogExecution('DEBUG', 'a_GLOBAL_unmatch_array', a_GLOBAL_unmatch_array);
		nlapiLogExecution('DEBUG', 'a_product_mapping_OVERALL_array', a_product_mapping_OVERALL_array);
		nlapiLogExecution('DEBUG', 'a_bill_mapping_OVERALL_array', a_bill_mapping_OVERALL_array);
		nlapiLogExecution('DEBUG', 'matchings', matchings);
		nlapiLogExecution('DEBUG', 'form', form);
		nlapiLogExecution('DEBUG', 'a_bill_array_1', a_bill_array_1);
		nlapiLogExecution('DEBUG', 'a_data_array_1', a_data_array_1);
		nlapiLogExecution('DEBUG', 'a_bill_array_2', a_bill_array_2);
		nlapiLogExecution('DEBUG', 'a_data_array_2', a_data_array_2);
		nlapiLogExecution('DEBUG', 'a_bill_no_display_array_1', a_bill_no_display_array_1);
		nlapiLogExecution('DEBUG', 'a_bill_no_display_array_2', a_bill_no_display_array_2);
		nlapiLogExecution('DEBUG', 'a_compare_array_1', a_compare_array_1);
		nlapiLogExecution('DEBUG', 'a_compare_array_2', a_compare_array_2);
		nlapiLogExecution('DEBUG', 'a_bill_occurences_1', a_bill_occurences_1);
		nlapiLogExecution('DEBUG', 'a_bill_occurences_2', a_bill_occurences_2);
		nlapiLogExecution('DEBUG', 'a_green_array_1', a_green_array_1);
		nlapiLogExecution('DEBUG', 'a_orange_array_1', a_orange_array_1);
		nlapiLogExecution('DEBUG', 'a_green_array_2', a_green_array_2);
		nlapiLogExecution('DEBUG', 'a_orange_array_2', a_orange_array_2);
		nlapiLogExecution('DEBUG', 'a_white_array_1', a_white_array_1);
		nlapiLogExecution('DEBUG', 's_unmatch_content', s_unmatch_content);
		nlapiLogExecution('DEBUG', 'reconcile_Array_before_Load', reconcile_Array_before_Load);
		nlapiLogExecution('DEBUG', 'a_unauthorised_array', a_unauthorised_array);
		nlapiLogExecution('DEBUG', 'a_Bill_Array_scroll', a_Bill_Array_scroll);
		nlapiLogExecution('DEBUG', 'a_AP_Order_Array_scroll', a_AP_Order_Array_scroll);

		add_reconcile_ui(f_partner, i_partner, a_product_mappings_array, d_ap_bill_from_date, d_ap_bill_to_date, d_ap_product_from_date, d_ap_product_to_date, a_GLOBAL_unmatch_array, a_product_mapping_OVERALL_array, a_bill_mapping_OVERALL_array, matchings, form, a_bill_array_1, a_data_array_1, a_bill_array_2, a_data_array_2, a_bill_no_display_array_1, a_bill_no_display_array_2, a_compare_array_1, a_compare_array_2, a_bill_occurences_1, a_bill_occurences_2, a_green_array_1, a_orange_array_1, a_green_array_2, a_orange_array_2, a_white_array_1, s_unmatch_content, reconcile_Array_before_Load, a_unauthorised_array, a_Bill_Array_scroll, a_AP_Order_Array_scroll);

		response.writePage(form);
	} else if (request.getMethod() == 'POST') {

	}
} //Suitelet Function

/** 
 * @param value
 * @returns
 */
function _logValidation(value) {
	if (value != null && value != 'undefined' && value != undefined && value != '' && value != 'NaN' && value != ' ') {
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

function findOccurrences(a, i) {
	var result = 0;
	for (var o in a)
		if (a[o] == i)
			result++;
	return result;
}

function add_reconcile_ui(f_partner, i_partner, a_product_mappings_array, d_ap_bill_from_date, d_ap_bill_to_date, d_ap_product_from_date, d_ap_product_to_date, a_GLOBAL_unmatch_array, a_product_mapping_OVERALL_array, a_bill_mapping_OVERALL_array, matchings, form, a_bill_array_1, a_data_array_1, a_bill_array_2, a_data_array_2, a_bill_no_display_array_1, a_bill_no_display_array_2, a_compare_array_1, a_compare_array_2, a_bill_occurences_1, a_bill_occurences_2, a_green_array_1, a_orange_array_1, a_green_array_2, a_orange_array_2, a_white_array_1, s_unmatch_content_ui, reconcile_Array_before_Load, a_unauthorised_array, a_Bill_Array_scroll, a_AP_Order_Array_scroll) {
	try {
		var i_cnt = 0;

		var URL_ADD_NEW_ORDER = "https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=customscript_sut_mp_sl_auspost_create_or&deploy=customdeploy_sut_mp_sl_auspost_create_or";

		// ============== PRODUCT RECONCILLIATION PAGE PARAMS ===============

		var a_product_reconcilliation_array = get_product_reconcilliation_page_parameters();

		var i_unauthorized_item = a_product_reconcilliation_array[0].unauthorized_item;

		var a_qty_data_array_1 = new Array();
		var a_qty_data_array_2 = new Array();


		// =============== GET PARTNER RESULTS ===============

		var ptrStr = get_partner(i_partner);

		// ======== GET DATA ================

		var f_reconcile_ui = form.addField('custpage_id_1', 'inlinehtml');

		var strVar = "";

		strVar += "<!DOCTYPE html>";
		strVar += "<html>";
		strVar += "<head>";
		strVar += "<meta charset=\"ISO-8859-1\">";
		strVar += "<title>Insert title here<\/title>";
		strVar += " <script type='text\/javascript' src='" + jquery_min + "'><\/script>";

		strVar += " <script type='text\/javascript' src='" + jquery_ui + "'><\/script>";
		strVar += " <link href='" + jquery_ui_css + "' rel='stylesheet' type='text\/css'\/>";
		strVar += "<link href='" + icon_css + "' rel=\"stylesheet\">";
		strVar += "<\/head>";
		strVar += "<style>";
		strVar += "h1 {";
		strVar += "    font-size: 150%;";
		strVar += "}";
		strVar += "h2 {";
		strVar += "    font-size: 80%;";
		strVar += "}";
		strVar += "	table.table1";
		strVar += "	{";
		strVar += " padding: 5px 20px 5px 20px;";
		strVar += "     border: 1px solid black;";
		strVar += "  border-radius: 20px;";
		strVar += " }";
		strVar += "    table.table3";
		strVar += "	{";
		strVar += "     border: 1px solid black;";
		strVar += " }";
		strVar += "    table.aptable1";
		strVar += "	{";
		strVar += " padding: 5px 20px 5px 20px;";
		strVar += "     border: 1px solid black; ";
		strVar += "  border-radius: 20px;";
		strVar += "  } ";
		strVar += "  table.aptable_green1";
		strVar += "	{";
		strVar += "    border: 1px solid black; ";
		strVar += "    background: lightgreen;";
		strVar += "  } ";
		strVar += "  table.table2";
		strVar += "	{";
		strVar += "     border: 1px solid black;";
		strVar += " }";
		strVar += "  td.apbilltable";
		strVar += "	{";
		strVar += "     border: 0px solid black;";
		strVar += "  ";
		strVar += "  }";
		strVar += " td.approducttable";
		strVar += "	{";
		strVar += "    border: 0px solid black;";
		strVar += " }";
		strVar += " table.apitemtable1";
		strVar += "	{";
		strVar += "    border: 1px solid black;";
		strVar += " }	    ";
		strVar += "	tr.trstyle1 td ";
		strVar += "	{";
		strVar += "	 background: #D3D3D3; ";
		strVar += "	}";
		strVar += "	tr.trstyle2 td ";
		strVar += "	{";
		strVar += "	 background: #F5F5F5; ";
		strVar += "	}";
		strVar += "	tr.trstyle_un td ";
		strVar += "	{";
		strVar += "	 background: skyblue; ";
		strVar += "	}";
		strVar += "	tr.aptrstyle1 td ";
		strVar += "	{";
		strVar += "	 background: #D3D3D3; ";
		strVar += "	}";
		strVar += "	tr.aptrstyle2 td ";
		strVar += "	{";
		strVar += "	 background: #F5F5F5; ";
		strVar += "	}";
		strVar += ".green";
		strVar += "{";
		strVar += "    background-color: lightgreen";
		strVar += "}";
		strVar += ".orange";
		strVar += "{";
		strVar += "    background-color: orange";
		strVar += "}";
		strVar += ".white";
		strVar += "{";
		strVar += "    background-color: white";
		strVar += "}";
		strVar += ".draggable";
		strVar += "{";
		strVar += " background-color: yellow;";
		strVar += " filter: alpha(opacity=60);";
		strVar += " opacity: 0.6;";
		strVar += "  border-radius: 20px;";
		strVar += "}";
		strVar += ".dropped";
		strVar += "{";
		strVar += "    position: static ;";
		strVar += "}";
		strVar += ".inner:hover {";
		strVar += "  cursor: pointer;";
		strVar += "}";
		strVar += ".mark"
		strVar += "  {"
		strVar += "  background-color:transparent;";
		strVar += "    cursor: pointer;";
		strVar += " }"
		strVar += ".jumper_product"
		strVar += "  {"
		strVar += "  cursor: pointer;";
		strVar += " }"
		strVar += ".jumper"
		strVar += "  {"
		strVar += "  cursor: pointer;";
		strVar += " }"

		strVar += ".thinbar";
		strVar += "	{";
		strVar += "	width:10px;";
		strVar += "	float: right;";
		strVar += "	background-color:red;";
		strVar += "	height:100%;";
		strVar += "	}";
		strVar += ".arrowleft {";
		strVar += "width: 0;";
		strVar += "height: 0;";
		strVar += "border-style: solid;";
		strVar += "border-width: 9px 9px 9px 0;";
		strVar += "border-color: transparent #0033ff transparent transparent;";
		strVar += "}";
		strVar += ".dispute {";
		strVar += "	-moz-box-shadow:inset 0px 1px 0px 0px #f29c93;";
		strVar += "	-webkit-box-shadow:inset 0px 1px 0px 0px #f29c93;";
		strVar += "	box-shadow:inset 0px 1px 0px 0px #f29c93;";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #fe1a00), color-stop(1, #ce0100));";
		strVar += "	background:-moz-linear-gradient(top, #fe1a00 5%, #ce0100 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #fe1a00 5%, #ce0100 100%);";
		strVar += "	background:-o-linear-gradient(top, #fe1a00 5%, #ce0100 100%);";
		strVar += "	background:-ms-linear-gradient(top, #fe1a00 5%, #ce0100 100%);";
		strVar += "	background:linear-gradient(to bottom, #fe1a00 5%, #ce0100 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#fe1a00', endColorstr='#ce0100',GradientType=0);";
		strVar += "	background-color:#fe1a00;";
		strVar += "	-moz-border-radius:6px;";
		strVar += "	-webkit-border-radius:6px;";
		strVar += "	border-radius:6px;";
		strVar += "	border:1px solid #d83526;";
		strVar += "	display:inline-block;";
		strVar += "	cursor:pointer;";
		strVar += "	color:#ffffff;";
		strVar += "	font-family:Arial;";
		strVar += "	font-size:11px;";
		strVar += "	font-weight:bold;";
		strVar += "	padding:2px 3px;";
		strVar += "	text-decoration:none;";
		strVar += "	text-shadow:0px 1px 0px #b23e35;";
		strVar += "}";
		strVar += ".dispute:hover {";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #ce0100), color-stop(1, #fe1a00));";
		strVar += "	background:-moz-linear-gradient(top, #ce0100 5%, #fe1a00 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #ce0100 5%, #fe1a00 100%);";
		strVar += "	background:-o-linear-gradient(top, #ce0100 5%, #fe1a00 100%);";
		strVar += "	background:-ms-linear-gradient(top, #ce0100 5%, #fe1a00 100%);";
		strVar += "	background:linear-gradient(to bottom, #ce0100 5%, #fe1a00 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ce0100', endColorstr='#fe1a00',GradientType=0);";
		strVar += "	background-color:#ce0100;";
		strVar += "}";
		strVar += ".dispute:active {";
		strVar += "	position:relative;";
		strVar += "	top:1px;";
		strVar += "}";
		strVar += ".confirm {";
		strVar += "	-moz-box-shadow:inset -30px 1px 10px -23px #3dc21b;";
		strVar += "	-webkit-box-shadow:inset -30px 1px 10px -23px #3dc21b;";
		strVar += "	box-shadow:inset -30px 1px 10px -23px #3dc21b;";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #44c767), color-stop(1, #5cbf2a));";
		strVar += "	background:-moz-linear-gradient(top, #44c767 5%, #5cbf2a 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #44c767 5%, #5cbf2a 100%);";
		strVar += "	background:-o-linear-gradient(top, #44c767 5%, #5cbf2a 100%);";
		strVar += "	background:-ms-linear-gradient(top, #44c767 5%, #5cbf2a 100%);";
		strVar += "	background:linear-gradient(to bottom, #44c767 5%, #5cbf2a 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#44c767', endColorstr='#5cbf2a',GradientType=0);";
		strVar += "	background-color:#44c767;";
		strVar += "	-moz-border-radius:6px;";
		strVar += "	-webkit-border-radius:6px;";
		strVar += "	border-radius:6px;";
		strVar += "	border:1px solid #18ab29;";
		strVar += "	display:inline-block;";
		strVar += "	cursor:pointer;";
		strVar += "	color:#ffffff;";
		strVar += "	font-family:Arial;";
		strVar += "	font-size:11px;";
		strVar += "	font-weight:bold;";
		strVar += "	padding:2px 3px;";
		strVar += "	text-decoration:none;";
		strVar += "	text-shadow:0px -1px 0px #810e05;";
		strVar += "}";
		strVar += ".confirm:hover {";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #5cbf2a), color-stop(1, #44c767));";
		strVar += "	background:-moz-linear-gradient(top, #5cbf2a 5%, #44c767 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #5cbf2a 5%, #44c767 100%);";
		strVar += "	background:-o-linear-gradient(top, #5cbf2a 5%, #44c767 100%);";
		strVar += "	background:-ms-linear-gradient(top, #5cbf2a 5%, #44c767 100%);";
		strVar += "	background:linear-gradient(to bottom, #5cbf2a 5%, #44c767 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#5cbf2a', endColorstr='#44c767',GradientType=0);";
		strVar += "	background-color:#5cbf2a;";
		strVar += "}";
		strVar += ".confirm:active {";
		strVar += "	position:relative;";
		strVar += "	top:1px;";
		strVar += "}";
		strVar += ".deliver {";
		strVar += "	-moz-box-shadow:inset -30px 1px 10px -23px #3dc21b;";
		strVar += "	-webkit-box-shadow:inset -30px 1px 10px -23px #3dc21b;";
		strVar += "	box-shadow:inset -30px 1px 10px -23px #3dc21b;";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #44c767), color-stop(1, #5cbf2a));";
		strVar += "	background:-moz-linear-gradient(top, #44c767 5%, #5cbf2a 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #44c767 5%, #5cbf2a 100%);";
		strVar += "	background:-o-linear-gradient(top, #44c767 5%, #5cbf2a 100%);";
		strVar += "	background:-ms-linear-gradient(top, #44c767 5%, #5cbf2a 100%);";
		strVar += "	background:linear-gradient(to bottom, #44c767 5%, #5cbf2a 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#44c767', endColorstr='#5cbf2a',GradientType=0);";
		strVar += "	background-color:#44c767;";
		strVar += "	-moz-border-radius:6px;";
		strVar += "	-webkit-border-radius:6px;";
		strVar += "	border-radius:6px;";
		strVar += "	border:1px solid #18ab29;";
		strVar += "	display:inline-block;";
		strVar += "	cursor:pointer;";
		strVar += "	color:#ffffff;";
		strVar += "	font-family:Arial;";
		strVar += "	font-size:11px;";
		strVar += "	font-weight:bold;";
		strVar += "	padding:2px 3px;";
		strVar += "	text-decoration:none;";
		strVar += "	text-shadow:0px -1px 0px #810e05;";
		strVar += "}";
		strVar += ".deliver:hover {";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #5cbf2a), color-stop(1, #44c767));";
		strVar += "	background:-moz-linear-gradient(top, #5cbf2a 5%, #44c767 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #5cbf2a 5%, #44c767 100%);";
		strVar += "	background:-o-linear-gradient(top, #5cbf2a 5%, #44c767 100%);";
		strVar += "	background:-ms-linear-gradient(top, #5cbf2a 5%, #44c767 100%);";
		strVar += "	background:linear-gradient(to bottom, #5cbf2a 5%, #44c767 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#5cbf2a', endColorstr='#44c767',GradientType=0);";
		strVar += "	background-color:#5cbf2a;";
		strVar += "}";
		strVar += ".deliver:active {";
		strVar += "	position:relative;";
		strVar += "	top:1px;";
		strVar += "}";
		strVar += ".cancel {";
		strVar += "	-moz-box-shadow:inset 0px 1px 0px 0px #f29c93;";
		strVar += "	-webkit-box-shadow:inset 0px 1px 0px 0px #f29c93;";
		strVar += "	box-shadow:inset 0px 1px 0px 0px #f29c93;";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #fe1a00), color-stop(1, #ce0100));";
		strVar += "	background:-moz-linear-gradient(top, #fe1a00 5%, #ce0100 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #fe1a00 5%, #ce0100 100%);";
		strVar += "	background:-o-linear-gradient(top, #fe1a00 5%, #ce0100 100%);";
		strVar += "	background:-ms-linear-gradient(top, #fe1a00 5%, #ce0100 100%);";
		strVar += "	background:linear-gradient(to bottom, #fe1a00 5%, #ce0100 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#fe1a00', endColorstr='#ce0100',GradientType=0);";
		strVar += "	background-color:#fe1a00;";
		strVar += "	-moz-border-radius:6px;";
		strVar += "	-webkit-border-radius:6px;";
		strVar += "	border-radius:6px;";
		strVar += "	border:1px solid #d83526;";
		strVar += "	display:inline-block;";
		strVar += "	cursor:pointer;";
		strVar += "	color:#ffffff;";
		strVar += "	font-family:Arial;";
		strVar += "	font-size:11px;";
		strVar += "	font-weight:bold;";
		strVar += "	padding:2px 3px;";
		strVar += "	text-decoration:none;";
		strVar += "	text-shadow:0px 1px 0px #b23e35;";
		strVar += "}";
		strVar += ".cancel:hover {";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #ce0100), color-stop(1, #fe1a00));";
		strVar += "	background:-moz-linear-gradient(top, #ce0100 5%, #fe1a00 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #ce0100 5%, #fe1a00 100%);";
		strVar += "	background:-o-linear-gradient(top, #ce0100 5%, #fe1a00 100%);";
		strVar += "	background:-ms-linear-gradient(top, #ce0100 5%, #fe1a00 100%);";
		strVar += "	background:linear-gradient(to bottom, #ce0100 5%, #fe1a00 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ce0100', endColorstr='#fe1a00',GradientType=0);";
		strVar += "	background-color:#ce0100;";
		strVar += "}";
		strVar += ".cancel:active {";
		strVar += "	position:relative;";
		strVar += "	top:1px;";
		strVar += "}";
		strVar += ".edit {";
		strVar += "	-moz-box-shadow:inset 0px 1px 0px 0px #97c4fe;";
		strVar += "	-webkit-box-shadow:inset 0px 1px 0px 0px #97c4fe;";
		strVar += "	box-shadow:inset 0px 1px 0px 0px #97c4fe;";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #3d94f6), color-stop(1, #1e62d0));";
		strVar += "	background:-moz-linear-gradient(top, #3d94f6 5%,#1e62d0 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);";
		strVar += "	background:-o-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);";
		strVar += "	background:-ms-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);";
		strVar += "	background:linear-gradient(to bottom, #3d94f6 5%, #1e62d0 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#3d94f6', endColorstr='#1e62d0',GradientType=0);";
		strVar += "	background-color:#3d94f6;";
		strVar += "	-moz-border-radius:6px;";
		strVar += "	-webkit-border-radius:6px;";
		strVar += "	border-radius:6px;";
		strVar += "	border:1px solid #3d94f6;";
		strVar += "	display:inline-block;";
		strVar += "	cursor:pointer;";
		strVar += "	color:#ffffff;";
		strVar += "	font-family:Arial;";
		strVar += "	font-size:11px;";
		strVar += "	font-weight:bold;";
		strVar += "	padding:2px 3px;";
		strVar += "	text-decoration:none;";
		strVar += "	text-shadow:0px 1px 0px #b23e35;";
		strVar += "}";
		strVar += ".edit:hover {";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #ce0100), color-stop(1, #3d94f6));";
		strVar += "	background:-moz-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);";
		strVar += "	background:-webkit-linear-gradient(top, ##1e62d0 5%, #3d94f6 100%);";
		strVar += "	background:-o-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);";
		strVar += "	background:-ms-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);";
		strVar += "	background:linear-gradient(to bottom, #1e62d0 5%, #3d94f6 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='##1e62d0', endColorstr='#3d94f6',GradientType=0);";
		strVar += "	background-color:#1e62d0;";
		strVar += "}";
		strVar += ".edit:active {";
		strVar += "	position:relative;";
		strVar += "	top:1px;";
		strVar += "}";
		strVar += ".reconcile {";
		strVar += "	-moz-box-shadow:inset 0px 1px 0px 0px #97c4fe;";
		strVar += "	-webkit-box-shadow:inset 0px 1px 0px 0px #97c4fe;";
		strVar += "	box-shadow:inset 0px 1px 0px 0px #97c4fe;";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #3d94f6), color-stop(1, #1e62d0));";
		strVar += "	background:-moz-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);";
		strVar += "	background:-o-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);";
		strVar += "	background:-ms-linear-gradient(top, #3d94f6 5%, #1e62d0 100%);";
		strVar += "	background:linear-gradient(to bottom, #3d94f6 5%, #1e62d0 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#3d94f6', endColorstr='#1e62d0',GradientType=0);";
		strVar += "	background-color:#3d94f6;";
		strVar += "	-moz-border-radius:6px;";
		strVar += "	-webkit-border-radius:6px;";
		strVar += "	border-radius:6px;";
		strVar += "	border:1px solid #337fed;";
		strVar += "	display:inline-block;";
		strVar += "	cursor:pointer;";
		strVar += "	color:#ffffff;";
		strVar += "	font-family:Arial;";
		strVar += "	font-size:15px;";
		strVar += "	font-weight:bold;";
		strVar += "	padding:6px 24px;";
		strVar += "	text-decoration:none;";
		strVar += "	text-shadow:0px 1px 0px #1570cd;";
		strVar += "}";
		strVar += ".reconcile:hover {";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #1e62d0), color-stop(1, #3d94f6));";
		strVar += "	background:-moz-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);";
		strVar += "	background:-o-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);";
		strVar += "	background:-ms-linear-gradient(top, #1e62d0 5%, #3d94f6 100%);";
		strVar += "	background:linear-gradient(to bottom, #1e62d0 5%, #3d94f6 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#1e62d0', endColorstr='#3d94f6',GradientType=0);";
		strVar += "	background-color:#1e62d0;";
		strVar += "}";
		strVar += ".reconcile:active {";
		strVar += "	position:relative;";
		strVar += "	top:1px;";
		strVar += "}";
		strVar += ".addneworder {";
		strVar += "	-moz-box-shadow:inset 0px 1px 0px 0px #ffffff;";
		strVar += "	-webkit-box-shadow:inset 0px 1px 0px 0px #ffffff;";
		strVar += "	box-shadow:inset 0px 1px 0px 0px #ffffff;";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #ededed), color-stop(1, #dfdfdf));";
		strVar += "	background:-moz-linear-gradient(top, #ededed 5%, #dfdfdf 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #ededed 5%, #dfdfdf 100%);";
		strVar += "	background:-o-linear-gradient(top, #ededed 5%, #dfdfdf 100%);";
		strVar += "	background:-ms-linear-gradient(top, #ededed 5%, #dfdfdf 100%);";
		strVar += "	background:linear-gradient(to bottom, #ededed 5%, #dfdfdf 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#ededed', endColorstr='#dfdfdf',GradientType=0);";
		strVar += "	background-color:#ededed;";
		strVar += "	-moz-border-radius:6px;";
		strVar += "	-webkit-border-radius:6px;";
		strVar += "	border-radius:6px;";
		strVar += "	border:1px solid #dcdcdc;";
		strVar += "	display:inline-block;";
		strVar += "	cursor:pointer;";
		strVar += "	color:#777777;";
		strVar += "	font-family:Arial;";
		strVar += "	font-size:15px;";
		strVar += "	font-weight:bold;";
		strVar += "	padding:10px 11px;";
		strVar += "	text-decoration:none;";
		strVar += "	text-shadow:0px 1px 0px #ffffff;";
		strVar += "}";
		strVar += ".addneworder:hover {";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #dfdfdf), color-stop(1, #ededed));";
		strVar += "	background:-moz-linear-gradient(top, #dfdfdf 5%, #ededed 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #dfdfdf 5%, #ededed 100%);";
		strVar += "	background:-o-linear-gradient(top, #dfdfdf 5%, #ededed 100%);";
		strVar += "	background:-ms-linear-gradient(top, #dfdfdf 5%, #ededed 100%);";
		strVar += "	background:linear-gradient(to bottom, #dfdfdf 5%, #ededed 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#dfdfdf', endColorstr='#ededed',GradientType=0);";
		strVar += "	background-color:#dfdfdf;";
		strVar += "}";
		strVar += ".addneworder:active {";
		strVar += "	position:relative;";
		strVar += "	top:1px;";
		strVar += "}";
		strVar += ".apply {";
		strVar += "	-moz-box-shadow:inset 0px 1px 0px 0px #e184f3;";
		strVar += "	-webkit-box-shadow:inset 0px 1px 0px 0px #e184f3;";
		strVar += "	box-shadow:inset 0px 1px 0px 0px #e184f3;";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #c123de), color-stop(1, #a20dbd));";
		strVar += "	background:-moz-linear-gradient(top, #c123de 5%, #a20dbd 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #c123de 5%, #a20dbd 100%);";
		strVar += "	background:-o-linear-gradient(top, #c123de 5%, #a20dbd 100%);";
		strVar += "	background:-ms-linear-gradient(top, #c123de 5%, #a20dbd 100%);";
		strVar += "	background:linear-gradient(to bottom, #c123de 5%, #a20dbd 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#c123de', endColorstr='#a20dbd',GradientType=0);";
		strVar += "	background-color:#c123de;";
		strVar += "	-moz-border-radius:6px;";
		strVar += "	-webkit-border-radius:6px;";
		strVar += "	border-radius:6px;";
		strVar += "	border:1px solid #a511c0;";
		strVar += "	display:inline-block;";
		strVar += "	cursor:pointer;";
		strVar += "	color:#ffffff;";
		strVar += "	font-family:Arial;";
		strVar += "	font-size:12px;";
		strVar += "	font-weight:bold;";
		strVar += "	padding:4px 8px;";
		strVar += "	text-decoration:none;";
		strVar += "	text-shadow:0px 1px 0px #9b14b3;";
		strVar += "}";
		strVar += ".apply:hover {";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #a20dbd), color-stop(1, #c123de));";
		strVar += "	background:-moz-linear-gradient(top, #a20dbd 5%, #c123de 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #a20dbd 5%, #c123de 100%);";
		strVar += "	background:-o-linear-gradient(top, #a20dbd 5%, #c123de 100%);";
		strVar += "	background:-ms-linear-gradient(top, #a20dbd 5%, #c123de 100%);";
		strVar += "	background:linear-gradient(to bottom, #a20dbd 5%, #c123de 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#a20dbd', endColorstr='#c123de',GradientType=0);";
		strVar += "	background-color:#a20dbd;";
		strVar += "}";
		strVar += ".apply:active {";
		strVar += "	position:relative;";
		strVar += "	top:1px;";
		strVar += "}";
		strVar += ".ui-state-hover";
		strVar += "{";
		strVar += "   background-color: red;";
		strVar += "}";
		strVar += ".ui-state-active";
		strVar += "{";
		strVar += "   background-color: blue;";
		strVar += "}";

		strVar += ".outstanding";
		strVar += "{";
		// strVar += "  font-family: 'Times New Roman', Times, serif;";
		strVar += "	font-size:16px;";
		strVar += "	font-weight:bold;";
		strVar += "	color:red;";
		strVar += "}";
		strVar += ".totalamount";
		strVar += "{";
		strVar += "	font-size:18px;";
		strVar += "	font-weight:bold;";
		strVar += "	color:black;";
		strVar += "}";
		strVar += ".headers";
		strVar += "{";
		strVar += "	font-size:14px;";
		strVar += "	color:black;";
		strVar += "}";
		strVar += "";
		strVar += "#label {";
		strVar += "  text-align: center;";
		strVar += "  line-height: 30px;";
		strVar += "  color: black;";
		strVar += "}";

		strVar += ".apply_partner {";
		strVar += "	-moz-box-shadow:inset 0px 1px 0px 0px #a4e271;";
		strVar += "	-webkit-box-shadow:inset 0px 1px 0px 0px #a4e271;";
		strVar += "	box-shadow:inset 0px 1px 0px 0px #a4e271;";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #89c403), color-stop(1, #77a809));";
		strVar += "	background:-moz-linear-gradient(top, #89c403 5%, #77a809 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #89c403 5%, #77a809 100%);";
		strVar += "	background:-o-linear-gradient(top, #89c403 5%, #77a809 100%);";
		strVar += "	background:-ms-linear-gradient(top, #89c403 5%, #77a809 100%);";
		strVar += "	background:linear-gradient(to bottom, #89c403 5%, #77a809 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#89c403', endColorstr='#77a809',GradientType=0);";
		strVar += "	background-color:#89c403;";
		strVar += "	-moz-border-radius:6px;";
		strVar += "	-webkit-border-radius:6px;";
		strVar += "	border-radius:6px;";
		strVar += "	border:1px solid #74b807;";
		strVar += "	display:inline-block;";
		strVar += "	cursor:pointer;";
		strVar += "	color:#ffffff;";
		strVar += "	font-family:Arial;";
		strVar += "	font-size:12px;";
		strVar += "	font-weight:bold;";
		strVar += "	padding:4px 8px;";
		strVar += "	text-decoration:none;";
		strVar += "	text-shadow:0px 1px 0px #528009;";
		strVar += "}";
		strVar += ".apply_partner:hover {";
		strVar += "	background:-webkit-gradient(linear, left top, left bottom, color-stop(0.05, #77a809), color-stop(1, #89c403));";
		strVar += "	background:-moz-linear-gradient(top, #77a809 5%, #89c403 100%);";
		strVar += "	background:-webkit-linear-gradient(top, #77a809 5%, #89c403 100%);";
		strVar += "	background:-o-linear-gradient(top, #77a809 5%, #89c403 100%);";
		strVar += "	background:-ms-linear-gradient(top, #77a809 5%, #89c403 100%);";
		strVar += "	background:linear-gradient(to bottom, #77a809 5%, #89c403 100%);";
		strVar += "	filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#77a809', endColorstr='#89c403',GradientType=0);";
		strVar += "	background-color:#77a809;";
		strVar += "}";
		strVar += ".apply_partner:active {";
		strVar += "	position:relative;";
		strVar += "	top:1px;";
		strVar += "}";

		strVar += "select {";
		strVar += "  font-size: 12px; ";
		strVar += "  -moz-border-radius       : 6px;";
		strVar += "  -webkit-border-radius    : 6px;";
		strVar += "  border-radius            : 6px;";
		strVar += "  -webkit-appearance       : none;";
		strVar += "  -moz-appearance          : none;";
		strVar += "  appearance               : none; ";
		strVar += "  cursor                   : pointer;";
		strVar += "  outline                  : none;";
		strVar += "  color                    : black;  ";
		strVar += "}";
		strVar += "select#partner_apply option:nth-child(even) { background-color:#f5f5f5; }";

		strVar += "<\/style>";

		strVar += "<script>";
		strVar += "$(document).ready(function(){";
		strVar += "    $(\".partner_apply\").change(function(){        ";
		strVar += "        var i_partner_id = $(this).children(\":selected\").attr(\"id\");        ";
		strVar += "        var s_partner_name = $(\".partner_apply option:selected\").html();";
		strVar += "    window.open('" + sut_recon_deploy_script_with_partnerid + "'+i_partner_id);";
		strVar += "   window.close();   ";

		strVar += "    });";
		strVar += "});";
		strVar += "<\/script>";

		strVar += "  <script>";
		strVar += "  $( function() {";
		strVar += "    $( \"#ap_bill_from_date\").datepicker({dateFormat: 'dd/mm/yy',changeMonth: true,changeYear: true});";
		strVar += "  });";
		strVar += "  <\/script>";
		strVar += "  <script>";
		strVar += "  $( function() {";
		strVar += "    $( \"#ap_bill_to_date\").datepicker({dateFormat: 'dd/mm/yy',changeMonth: true,changeYear: true});";
		strVar += "  });";
		strVar += "  <\/script>";
		strVar += "  <script>";
		strVar += "  $( function() {";
		strVar += "    $( \"#ap_product_from_date\").datepicker({dateFormat: 'dd/mm/yy',changeMonth: true,changeYear: true});";
		strVar += "  });";
		strVar += "  <\/script>";

		strVar += "  <script>";
		strVar += " var a_reconcile_array = '" + reconcile_Array_before_Load + "';";
		strVar += "  <\/script>";
		strVar += "  <script>";
		strVar += " var a_linking_array ='" + a_product_mappings_array + "';";
		strVar += "  <\/script>";
		strVar += "  <script>";
		strVar += " var a_unauthorized_array = '" + a_unauthorised_array + "';";
		strVar += "  <\/script>";
		strVar += "  <script>";
		strVar += "   var a_ap_bill_customerData =  new Array();";
		strVar += "  <\/script>";
		strVar += "  <script>";
		strVar += "   a_ap_bill_customerData = '" + a_Bill_Array_scroll + "';";
		strVar += "  <\/script>";
		strVar += "  <script>";
		strVar += "   var a_ap_order_customerData =  new Array();";
		strVar += "  <\/script>";
		strVar += "  <script>";
		//strVar += "alert('Before Block a_ap_order_strVar += "alert('Product Order Block...');"
		strVar += "try{"
		strVar += "    a_ap_order_customerData =  '" + a_AP_Order_Array_scroll + "';";
		strVar += "}"
		strVar += "catch(exception){"
		strVar += "alert('Error -->'+exception);"
		strVar += "}"
		strVar += "  <\/script>";
		strVar += "  <script>";
		strVar += " var a_unmatch_array= '" + s_unmatch_content_ui + "';";
		strVar += "  <\/script>";
		strVar += "  <script>";
		strVar += " var a_fully_reconcile_ARR ='' ;";
		strVar += " var a_partial_reconcile_ARR ='' ;";
		strVar += " var a_UNM_array ='' ;";
		strVar += " var a_unmatch_array_GLOBAL ='' ;";
		strVar += "  <\/script>";

		strVar += "  <script>";
		strVar += " function remove_duplicates(arr) ";
		strVar += " {";
		strVar += "     var seen = {};";
		strVar += "     var ret_arr = [];";
		strVar += "     for(var i = 0; i < arr.length; i++) ";
		strVar += "     {";
		strVar += "       if(!(arr[i] in seen))";
		strVar += "         {";
		strVar += "           ret_arr.push(arr[i]);";
		strVar += "           seen[arr[i]] = true; ";
		strVar += "       }";
		strVar += "    }";
		strVar += "    return ret_arr;";
		strVar += "    }";
		strVar += "  <\/script>";

		strVar += "  <script>";
		strVar += "var reconcile_params = new Array();";
		strVar += "  <\/script>";

		strVar += "  <script>";
		strVar += "function _logValidation(value)";
		strVar += "{";
		strVar += "  if(value!=null && value!=undefined && value!='' && value!='NaN' && value!=' ')";
		strVar += "  {";
		strVar += "	  return true;";
		strVar += "  }	 ";
		strVar += "  else	  ";
		strVar += "  {";
		strVar += "	  return false;";
		strVar += "  }";
		strVar += "}";
		strVar += "  <\/script>";

		strVar += "  <script>";

		// SCROLL FUNCTION 
		strVar += " function GetAp_Bill_Order_Final_Label(a_ap_bill_customerData,i_bill_1_G,type)";
		strVar += "{ "
		strVar += "	var a_ap_bill_customerData_splitter = a_ap_bill_customerData.toString().split('####');";
		strVar += "for(var bb = 0;bb<a_ap_bill_customerData_splitter.length;bb++)"
		strVar += "	{"
		strVar += "	   var s_inner_data_splitter = a_ap_bill_customerData_splitter[bb].split('@@@');"
		strVar += "	if(s_inner_data_splitter[0] == i_bill_1_G )"
		strVar += "{"
			// IFF DROP AREA IS AP BILL THEN GET AP ORDER DATA 
		strVar += "if(type == 'apbill')"
		strVar += "    	  {"
		strVar += "	  var ID = s_inner_data_splitter[0];"
		strVar += "   var A_assignment  =   s_inner_data_splitter[1];"
		strVar += "  var final_String =  'Assignment #:'+A_assignment+'('+ID+')';"
		strVar += "		      return final_String ;"
		strVar += "    break ;"
		strVar += " 	  };"
			// IFF DROP AREA IS AP ORDER  THEN GET AP BILL DATA   
		strVar += "  if(type == 'aporder')"
		strVar += "	  {"
		strVar += " var ID = s_inner_data_splitter[0];"
		strVar += "     var customerPO =   s_inner_data_splitter[1];"
		strVar += " var a_Date = s_inner_data_splitter[2];"
		strVar += "	 var final_String = customerPO + ' - ' + a_Date + ' - Product Order #:'+ID ;"
		strVar += "		      return final_String ;"
		strVar += "		      break ;"
		strVar += " 	  };"
		strVar += " };"
		strVar += "};"
		strVar += "};"
		strVar += "  <\/script>";

		strVar += "  <script>";
		strVar += "  $( function() {";
		strVar += "    $( \"#ap_product_to_date\").datepicker({dateFormat: 'dd/mm/yy',changeMonth: true,changeYear: true});";
		strVar += "  });";
		strVar += "  <\/script>";
		strVar += " <script type=\"text\/javascript\">";
		strVar += "$(document).ready(function(){";
		strVar += "    $(\"input\").change(function(){";
		strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";
		strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";
		strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";
		strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";
		strVar += "if(d_bill_from_date!=null && d_bill_from_date!='' && d_bill_from_date!= undefined)";
		strVar += "{";
		strVar += "if(d_bill_to_date!=null && d_bill_to_date!='' && d_bill_to_date!= undefined)";
		strVar += "{";
		strVar += "d_bill_from_date = new Date(d_bill_from_date);";
		strVar += "d_bill_to_date = new Date(d_bill_to_date);";

		strVar += "if(d_bill_to_date < d_bill_from_date)";
		strVar += "{";
		strVar += "alert('From date cannot be greater than To Date.');";
		strVar += "jQuery(this).val('');";
		strVar += "}";
		strVar += "}";
		strVar += "}";
		strVar += "if(d_product_from_date!=null && d_product_from_date!='' && d_product_from_date!= undefined)";
		strVar += "{";
		strVar += "if(d_product_to_date!=null && d_product_to_date!='' && d_product_to_date!= undefined)";
		strVar += "{";
		strVar += "d_product_from_date = new Date(d_product_from_date);";
		strVar += "d_product_to_date = new Date(d_product_to_date);";

		strVar += "if(d_product_to_date < d_product_from_date)";
		strVar += "{";
		strVar += "alert('From date cannot be greater than To Date.');";
		strVar += "jQuery(this).val('');";
		strVar += "}";
		strVar += "}";
		strVar += "}";

		strVar += "        ";
		strVar += "    });";
		strVar += "});";

		strVar += "    <\/script>";

		strVar += " <script type=\"text\/javascript\">";

		strVar += "    function createInput(){";
		strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";
		strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";
		strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";
		strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";

		strVar += "if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
		strVar += "{";
		strVar += "   a_reconcile_array = a_reconcile_array.toString();";
		strVar += "   a_linking_array = a_linking_array.toString();";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		strVar += "   var a_unmatch_array_beforeload = '" + s_unmatch_content_ui + "';";
		strVar += "   var reconcile_Array_before_Load = '" + reconcile_Array_before_Load + "';";
		strVar += "   console.log('TEST');";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";

		strVar += "var blank_V = '';";
		strVar += "   var i_partner = '" + i_partner + "';";


		strVar += "reconcile_params['reconcile_array']={'reconcile_array':a_reconcile_array};";
		strVar += "reconcile_params['a_linking_array']={'a_linking_array':a_linking_array};";
		strVar += "reconcile_params['a_unmatch_array_GLOBAL']={'a_unmatch_array_GLOBAL':a_unmatch_array_GLOBAL};";
		strVar += "reconcile_params['a_unmatch_array']={'a_unmatch_array':a_unmatch_array};";
		strVar += "reconcile_params['a_unmatch_array_beforeload']={'a_unmatch_array_beforeload':a_unmatch_array_beforeload};";
		strVar += "reconcile_params['d_bill_from_date']={'d_bill_from_date':d_bill_from_date};";
		strVar += "reconcile_params['d_bill_to_date']={'d_bill_to_date':d_bill_to_date};";
		strVar += "reconcile_params['d_product_from_date']={'d_product_from_date':d_product_from_date};";
		strVar += "reconcile_params['d_product_to_date']={'d_product_to_date':d_product_to_date};";
		strVar += "reconcile_params['a_cancel_array']={'a_cancel_array':blank_V};";
		strVar += "reconcile_params['a_confirm_array']={'a_confirm_array':blank_V};";
		strVar += "reconcile_params['a_deliver_array']={'a_deliver_array':blank_V};";
		strVar += "reconcile_params['reconcile_Array_before_Load']={'reconcile_Array_before_Load':reconcile_Array_before_Load};";
		strVar += "reconcile_params['partner']={'partner':i_partner};";
		strVar += "reconcile_params['called_type']={'called_type':''};";


		strVar += "call_window(reconcile_params);";

		//strVar += "   window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=603&deploy=1&custscript_reconcile_array='+a_reconcile_array+'&custscript_linking_array='+a_linking_array+'&custscript_unmatched_array='+a_unmatch_array_GLOBAL+'&a_unmatch_array='+a_unmatch_array+'&a_unmatch_array_beforeload_to='+a_unmatch_array_beforeload+'&a_reconcile_array_beforeload_to='+reconcile_Array_before_Load+'&ap_bill_from_date='+d_bill_from_date+'&ap_bill_to_date='+d_bill_to_date+'&ap_product_from_date='+d_product_from_date+'&ap_product_to_date='+d_product_to_date);";
		//strVar += "   window.close();";
		strVar += "}";
		strVar += "else";
		strVar += "{";
		strVar += "alert('You cannot reconcile as there are no matching of records.');";
		strVar += "    window.open('" + sut_recon_deploy_script + "');";
		strVar += "   window.close();   ";
		strVar += "}";
		strVar += " }";
		strVar += "    <\/script>";
		strVar += " <script type=\"text\/javascript\">";
		/*
	strVar += "    function add_new_order(){";		
	strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";	
	strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";	
	strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";	
	strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";
	
	strVar += "if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
	strVar += "{";
	strVar += "   a_reconcile_array = a_reconcile_array.toString();     ";
	strVar += "}";	
	strVar += " window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=553&deploy=1&prod_recon=T&product_order_id=null&customer_id=null');";// 551
	//strVar += " window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=553&deploy=customdeploy_sl_auspost_create_order');";// 551
//	strVar += "   window.close();   ";
	strVar += "    }";	
	*/
		strVar += "    function add_new_order_2(){";

		strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";
		strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";
		strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";
		strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";

		strVar += "if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
		strVar += "{";
		strVar += "   a_reconcile_array = a_reconcile_array.toString();     ";
		strVar += "}";
		// TO SEND DATA TO RECONCILE LINK 
		strVar += "   a_linking_array = a_linking_array.toString();";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		strVar += "   var a_unmatch_array_beforeload = '" + s_unmatch_content_ui + "';";
		strVar += "   var reconcile_Array_before_Load = '" + reconcile_Array_before_Load + "';";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		//	strVar += "   newWindow_2 =  window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=603&deploy=1&custscript_reconcile_array='+a_reconcile_array+'&custscript_linking_array='+a_linking_array+'&custscript_unmatched_array='+a_unmatch_array_GLOBAL+'&a_unmatch_array='+a_unmatch_array+'&a_unmatch_array_beforeload_to='+a_unmatch_array_beforeload+'&a_reconcile_array_beforeload_to='+reconcile_Array_before_Load+'&ap_bill_from_date='+d_bill_from_date+'&ap_bill_to_date='+d_bill_to_date+'&ap_product_from_date='+d_product_from_date+'&ap_product_to_date='+d_product_to_date);";

		strVar += "var blank_V = '';";
		strVar += "   var i_partner = '" + i_partner + "';";

		strVar += "reconcile_params['reconcile_array']={'reconcile_array':a_reconcile_array};";
		strVar += "reconcile_params['a_linking_array']={'a_linking_array':a_linking_array};";
		strVar += "reconcile_params['a_unmatch_array_GLOBAL']={'a_unmatch_array_GLOBAL':a_unmatch_array_GLOBAL};";
		strVar += "reconcile_params['a_unmatch_array']={'a_unmatch_array':a_unmatch_array};";
		strVar += "reconcile_params['a_unmatch_array_beforeload']={'a_unmatch_array_beforeload':a_unmatch_array_beforeload};";
		strVar += "reconcile_params['d_bill_from_date']={'d_bill_from_date':d_bill_from_date};";
		strVar += "reconcile_params['d_bill_to_date']={'d_bill_to_date':d_bill_to_date};";
		strVar += "reconcile_params['d_product_from_date']={'d_product_from_date':d_product_from_date};";
		strVar += "reconcile_params['d_product_to_date']={'d_product_to_date':d_product_to_date};";
		strVar += "reconcile_params['a_cancel_array']={'a_cancel_array':blank_V};";
		strVar += "reconcile_params['a_confirm_array']={'a_confirm_array':blank_V};";
		strVar += "reconcile_params['a_deliver_array']={'a_deliver_array':blank_V};";
		strVar += "reconcile_params['reconcile_Array_before_Load']={'reconcile_Array_before_Load':reconcile_Array_before_Load};";
		strVar += "reconcile_params['partner']={'partner':i_partner};";
		strVar += "reconcile_params['prod_recon']={'prod_recon':'T'};";
		//strVar += "reconcile_params['product_order_id']={'product_order_id':null};";
		//strVar += "reconcile_params['customer_id']={'customer_id':null};";
		strVar += "reconcile_params['called_type']={'called_type':'3'};";
		strVar += "call_window(reconcile_params);";

		strVar += "    }";
		strVar += "    <\/script>";
		strVar += " <script type=\"text\/javascript\">";
		strVar += "    function cancel(params){";
		strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";
		strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";
		strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";
		strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";
		strVar += "if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
		strVar += "{";
		strVar += "   a_reconcile_array = a_reconcile_array.toString();";
		strVar += "}";
		strVar += "if(a_linking_array!=null && a_linking_array!=''&&a_linking_array!=undefined)";
		strVar += "{";
		strVar += "   a_linking_array = a_linking_array.toString();";
		strVar += "}";
		strVar += "if(a_unmatch_array_GLOBAL!=null && a_unmatch_array_GLOBAL!=''&&a_unmatch_array_GLOBAL!=undefined)";
		strVar += "{";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		strVar += "}";

		strVar += "   var a_unmatch_array_beforeload = '" + s_unmatch_content_ui + "';";
		strVar += "   var reconcile_Array_before_Load = '" + reconcile_Array_before_Load + "';";

		strVar += "var blank_V = '';";
		strVar += "   var i_partner = '" + i_partner + "';";

		strVar += "reconcile_params['reconcile_array']={'reconcile_array':a_reconcile_array};";
		strVar += "reconcile_params['a_linking_array']={'a_linking_array':a_linking_array};";
		strVar += "reconcile_params['a_unmatch_array_GLOBAL']={'a_unmatch_array_GLOBAL':a_unmatch_array_GLOBAL};";
		strVar += "reconcile_params['a_unmatch_array']={'a_unmatch_array':a_unmatch_array};";
		strVar += "reconcile_params['a_unmatch_array_beforeload']={'a_unmatch_array_beforeload':a_unmatch_array_beforeload};";
		strVar += "reconcile_params['d_bill_from_date']={'d_bill_from_date':d_bill_from_date};";
		strVar += "reconcile_params['d_bill_to_date']={'d_bill_to_date':d_bill_to_date};";
		strVar += "reconcile_params['d_product_from_date']={'d_product_from_date':d_product_from_date};";
		strVar += "reconcile_params['d_product_to_date']={'d_product_to_date':d_product_to_date};";
		strVar += "reconcile_params['a_cancel_array']={'a_cancel_array':params};";
		strVar += "reconcile_params['a_confirm_array']={'a_confirm_array':blank_V};";
		strVar += "reconcile_params['a_deliver_array']={'a_deliver_array':blank_V};";
		strVar += "reconcile_params['reconcile_Array_before_Load']={'reconcile_Array_before_Load':reconcile_Array_before_Load};";
		strVar += "reconcile_params['partner']={'partner':i_partner};";
		strVar += "reconcile_params['called_type']={'called_type':''};";



		strVar += "call_window(reconcile_params);";

		//	strVar += "    window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=603&deploy=1&custscript_reconcile_array='+a_reconcile_array+'&custscript_linking_array='+a_linking_array+'&custscript_unmatched_array='+a_unmatch_array_GLOBAL+'&a_unmatch_array='+a_unmatch_array+'&a_unmatch_array_beforeload_to='+a_unmatch_array_beforeload+'&a_reconcile_array_beforeload_to='+reconcile_Array_before_Load+'&cancel_params='+params+'&ap_bill_from_date='+d_bill_from_date+'&ap_bill_to_date='+d_bill_to_date+'&ap_product_from_date='+d_product_from_date+'&ap_product_to_date='+d_product_to_date);";
		//	strVar += "   window.close();   ";
		strVar += "    }";
		strVar += "    <\/script>";
		strVar += " <script type=\"text\/javascript\">";
		strVar += "    function deliver(params){";
		strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";
		strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";
		strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";
		strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";

		strVar += "if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
		strVar += "{";
		strVar += "   a_reconcile_array = a_reconcile_array.toString();     ";
		strVar += "}";
		// TO SEND DATA TO RECONCILE LINK 
		strVar += "   a_linking_array = a_linking_array.toString();";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		strVar += "   var a_unmatch_array_beforeload = '" + s_unmatch_content_ui + "';";
		strVar += "   var reconcile_Array_before_Load = '" + reconcile_Array_before_Load + "';";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		//	strVar += "    window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=603&deploy=1&custscript_reconcile_array='+a_reconcile_array+'&custscript_linking_array='+a_linking_array+'&custscript_unmatched_array='+a_unmatch_array_GLOBAL+'&a_unmatch_array='+a_unmatch_array+'&a_unmatch_array_beforeload_to='+a_unmatch_array_beforeload+'&a_reconcile_array_beforeload_to='+reconcile_Array_before_Load+'&deliver_params='+params+'&ap_bill_from_date='+d_bill_from_date+'&ap_bill_to_date='+d_bill_to_date+'&ap_product_from_date='+d_product_from_date+'&ap_product_to_date='+d_product_to_date);";
		//  	strVar += "   window.close();   ";
		strVar += "var blank_V = '';";
		strVar += "   var i_partner = '" + i_partner + "';";

		strVar += "reconcile_params['reconcile_array']={'reconcile_array':a_reconcile_array};";
		strVar += "reconcile_params['a_linking_array']={'a_linking_array':a_linking_array};";
		strVar += "reconcile_params['a_unmatch_array_GLOBAL']={'a_unmatch_array_GLOBAL':a_unmatch_array_GLOBAL};";
		strVar += "reconcile_params['a_unmatch_array']={'a_unmatch_array':a_unmatch_array};";
		strVar += "reconcile_params['a_unmatch_array_beforeload']={'a_unmatch_array_beforeload':a_unmatch_array_beforeload};";
		strVar += "reconcile_params['d_bill_from_date']={'d_bill_from_date':d_bill_from_date};";
		strVar += "reconcile_params['d_bill_to_date']={'d_bill_to_date':d_bill_to_date};";
		strVar += "reconcile_params['d_product_from_date']={'d_product_from_date':d_product_from_date};";
		strVar += "reconcile_params['d_product_to_date']={'d_product_to_date':d_product_to_date};";
		strVar += "reconcile_params['a_cancel_array']={'a_cancel_array':blank_V};";
		strVar += "reconcile_params['a_confirm_array']={'a_confirm_array':blank_V};";
		strVar += "reconcile_params['a_deliver_array']={'a_deliver_array':params};";
		strVar += "reconcile_params['reconcile_Array_before_Load']={'reconcile_Array_before_Load':reconcile_Array_before_Load};";
		strVar += "reconcile_params['partner']={'partner':i_partner};";
		strVar += "reconcile_params['called_type']={'called_type':''};";



		strVar += "call_window(reconcile_params);";
		strVar += "    }";
		strVar += "    <\/script>";
		strVar += " <script type=\"text\/javascript\">";
		// Call to edit function
		/*
		strVar += "    function edit(params,i_bill_no_2){";		
		strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";	
		strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";	
		strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";	
		strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";
		strVar += "if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
		strVar += "{";
		strVar += "   a_reconcile_array = a_reconcile_array.toString();     ";
		strVar += "}";	
		var url_to_Call = nlapiResolveURL('SUITELET', 'customscript_sl_auspost_create_order', 'customdeploy_sl_auspost_create_order');
		strVar += "   var url_to_Call = '"+url_to_Call+"';";	
		strVar += " window.open(url_to_Call+'&customer_id='+params+'&product_order_id='+i_bill_no_2);";	
		//strVar += " window.close();   ";
		strVar += "    }";	
		*/
		// Call to edit 2 function 
		strVar += " function edit_2(params,i_bill_no_2){";
		strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";
		strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";
		strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";
		strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";
		strVar += " if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
		strVar += " {";
		strVar += "   a_reconcile_array = a_reconcile_array.toString();     ";
		strVar += " }";
		// TO SEND DATA TO RECONCILE LINK 
		strVar += "   a_linking_array = a_linking_array.toString();";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		strVar += "   var a_unmatch_array_beforeload = '" + s_unmatch_content_ui + "';";
		strVar += "   var reconcile_Array_before_Load = '" + reconcile_Array_before_Load + "';";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		//strVar += "   newWindow_2 =  window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=603&deploy=1&custscript_reconcile_array='+a_reconcile_array+'&custscript_linking_array='+a_linking_array+'&custscript_unmatched_array='+a_unmatch_array_GLOBAL+'&a_unmatch_array='+a_unmatch_array+'&a_unmatch_array_beforeload_to='+a_unmatch_array_beforeload+'&a_reconcile_array_beforeload_to='+reconcile_Array_before_Load+'&ap_bill_from_date='+d_bill_from_date+'&ap_bill_to_date='+d_bill_to_date+'&ap_product_from_date='+d_product_from_date+'&ap_product_to_date='+d_product_to_date);";
		strVar += "var blank_V = '';";
		strVar += "   var i_partner = '" + i_partner + "';";

		strVar += "reconcile_params['reconcile_array']={'reconcile_array':a_reconcile_array};";
		strVar += "reconcile_params['a_linking_array']={'a_linking_array':a_linking_array};";
		strVar += "reconcile_params['a_unmatch_array_GLOBAL']={'a_unmatch_array_GLOBAL':a_unmatch_array_GLOBAL};";
		strVar += "reconcile_params['a_unmatch_array']={'a_unmatch_array':a_unmatch_array};";
		strVar += "reconcile_params['a_unmatch_array_beforeload']={'a_unmatch_array_beforeload':a_unmatch_array_beforeload};";
		strVar += "reconcile_params['d_bill_from_date']={'d_bill_from_date':d_bill_from_date};";
		strVar += "reconcile_params['d_bill_to_date']={'d_bill_to_date':d_bill_to_date};";
		strVar += "reconcile_params['d_product_from_date']={'d_product_from_date':d_product_from_date};";
		strVar += "reconcile_params['d_product_to_date']={'d_product_to_date':d_product_to_date};";
		strVar += "reconcile_params['a_cancel_array']={'a_cancel_array':blank_V};";
		strVar += "reconcile_params['a_confirm_array']={'a_confirm_array':blank_V};";
		strVar += "reconcile_params['a_deliver_array']={'a_deliver_array':blank_V};";
		strVar += "reconcile_params['reconcile_Array_before_Load']={'reconcile_Array_before_Load':reconcile_Array_before_Load};";
		strVar += "reconcile_params['partner']={'partner':i_partner};";
		// EDIT PARAMETERS
		strVar += "reconcile_params['custrecord_customer_id']={'custrecord_customer_id':params};";
		strVar += "reconcile_params['custrecord_edit_product_order_id']={'custrecord_edit_product_order_id':i_bill_no_2};";
		strVar += "reconcile_params['called_type']={'called_type':'2'};";

		strVar += "call_window(reconcile_params);";
		strVar += "   }";
		strVar += "    <\/script>";
		strVar += " <script type=\"text\/javascript\">";
		strVar += "    function confirm(params){";

		strVar += "try{";
		strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";
		strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";
		strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";
		strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";

		strVar += "if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
		strVar += "{";
		strVar += "   a_reconcile_array = a_reconcile_array.toString();     ";
		strVar += "}";
		// TO SEND DATA TO RECONCILE LINK 
		strVar += "   a_linking_array = a_linking_array.toString();";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		strVar += "   var a_unmatch_array_beforeload = '" + s_unmatch_content_ui + "';";
		strVar += "   var reconcile_Array_before_Load = '" + reconcile_Array_before_Load + "';";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		strVar += "var blank_V = '';";
		strVar += "   var i_partner = '" + i_partner + "';";

		strVar += "reconcile_params['reconcile_array']={'reconcile_array':a_reconcile_array};";
		strVar += "reconcile_params['a_linking_array']={'a_linking_array':a_linking_array};";
		strVar += "reconcile_params['a_unmatch_array_GLOBAL']={'a_unmatch_array_GLOBAL':a_unmatch_array_GLOBAL};";
		strVar += "reconcile_params['a_unmatch_array']={'a_unmatch_array':a_unmatch_array};";
		strVar += "reconcile_params['a_unmatch_array_beforeload']={'a_unmatch_array_beforeload':a_unmatch_array_beforeload};";
		strVar += "reconcile_params['d_bill_from_date']={'d_bill_from_date':d_bill_from_date};";
		strVar += "reconcile_params['d_bill_to_date']={'d_bill_to_date':d_bill_to_date};";
		strVar += "reconcile_params['d_product_from_date']={'d_product_from_date':d_product_from_date};";
		strVar += "reconcile_params['d_product_to_date']={'d_product_to_date':d_product_to_date};";
		strVar += "reconcile_params['a_cancel_array']={'a_cancel_array':blank_V};";
		strVar += "reconcile_params['a_confirm_array']={'a_confirm_array':params};";
		strVar += "reconcile_params['a_deliver_array']={'a_deliver_array':blank_V};";
		strVar += "reconcile_params['reconcile_Array_before_Load']={'reconcile_Array_before_Load':reconcile_Array_before_Load};";
		strVar += "reconcile_params['partner']={'partner':i_partner};";
		strVar += "reconcile_params['called_type']={'called_type':i_partner};";

		strVar += "call_window(reconcile_params);";
		//strVar += "    window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=603&deploy=1&custscript_reconcile_array='+a_reconcile_array+'&custscript_linking_array='+a_linking_array+'&custscript_unmatched_array='+a_unmatch_array_GLOBAL+'&a_unmatch_array='+a_unmatch_array+'&a_unmatch_array_beforeload_to='+a_unmatch_array_beforeload+'&a_reconcile_array_beforeload_to='+reconcile_Array_before_Load+'&confirm_params='+params+'&ap_bill_from_date='+d_bill_from_date+'&ap_bill_to_date='+d_bill_to_date+'&ap_product_from_date='+d_product_from_date+'&ap_product_to_date='+d_product_to_date);";
		//strVar += "   window.close();   ";
		strVar += "}";
		strVar += "catch(excd){";
		strVar += "alert('Exception Caught -->'+excd);";
		strVar += "}";
		strVar += "    }";
		strVar += "    <\/script>";
		strVar += " <script type=\"text\/javascript\">";
		/*
	strVar += "    function dispute(params){";		
	strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";	
	strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";	
	strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";	
	strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";
	
	strVar += "if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
	strVar += "{";
	strVar += "   a_reconcile_array = a_reconcile_array.toString();     ";
	strVar += "}";	
	strVar += " window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=527&deploy=1&ap_stock_receipt_id='+params+'&type=product&upload_file=F&upload_file_id=' + null + '&file_type=T');";	
	//strVar += " window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=549&deploy=2&ap_stock_receipt_id='+params);";	
//	strVar += "   window.close();   ";
	strVar += "    }";
	*/
		strVar += "    function dispute_2(params){";

		strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";
		strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";
		strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";
		strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";

		strVar += "if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
		strVar += "{";
		strVar += "   a_reconcile_array = a_reconcile_array.toString();";
		strVar += "}";
		// TO SEND DATA TO RECONCILE LINK 
		strVar += "   a_linking_array = a_linking_array.toString();";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		strVar += "   var a_unmatch_array_beforeload = '" + s_unmatch_content_ui + "';";
		strVar += "   var reconcile_Array_before_Load = '" + reconcile_Array_before_Load + "';";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		//strVar += "   window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=603&deploy=1&custscript_reconcile_array='+a_reconcile_array+'&custscript_linking_array='+a_linking_array+'&custscript_unmatched_array='+a_unmatch_array_GLOBAL+'&a_unmatch_array='+a_unmatch_array+'&a_unmatch_array_beforeload_to='+a_unmatch_array_beforeload+'&a_reconcile_array_beforeload_to='+reconcile_Array_before_Load+'&ap_bill_from_date='+d_bill_from_date+'&ap_bill_to_date='+d_bill_to_date+'&ap_product_from_date='+d_product_from_date+'&ap_product_to_date='+d_product_to_date);";

		strVar += "var blank_V = '';";
		strVar += "   var i_partner = '" + i_partner + "';";

		strVar += "reconcile_params['reconcile_array']={'reconcile_array':a_reconcile_array};";
		strVar += "reconcile_params['a_linking_array']={'a_linking_array':a_linking_array};";
		strVar += "reconcile_params['a_unmatch_array_GLOBAL']={'a_unmatch_array_GLOBAL':a_unmatch_array_GLOBAL};";
		strVar += "reconcile_params['a_unmatch_array']={'a_unmatch_array':a_unmatch_array};";
		strVar += "reconcile_params['a_unmatch_array_beforeload']={'a_unmatch_array_beforeload':a_unmatch_array_beforeload};";
		strVar += "reconcile_params['d_bill_from_date']={'d_bill_from_date':d_bill_from_date};";
		strVar += "reconcile_params['d_bill_to_date']={'d_bill_to_date':d_bill_to_date};";
		strVar += "reconcile_params['d_product_from_date']={'d_product_from_date':d_product_from_date};";
		strVar += "reconcile_params['d_product_to_date']={'d_product_to_date':d_product_to_date};";
		strVar += "reconcile_params['a_cancel_array']={'a_cancel_array':blank_V};";
		strVar += "reconcile_params['a_confirm_array']={'a_confirm_array':blank_V};";
		strVar += "reconcile_params['a_deliver_array']={'a_deliver_array':blank_V};";
		strVar += "reconcile_params['reconcile_Array_before_Load']={'reconcile_Array_before_Load':reconcile_Array_before_Load};";
		strVar += "reconcile_params['partner']={'partner':i_partner};";
		// CALL TO DISPUTE FUNCTIONALITY 
		strVar += "reconcile_params['ap_stock_receipt_id']={'ap_stock_receipt_id':params};";
		strVar += "reconcile_params['ap_type']={'ap_type':'product'};";
		strVar += "reconcile_params['upload_file']={'upload_file':'F'};";
		//strVar += "reconcile_params['upload_file_id']={'upload_file_id':null};";
		strVar += "reconcile_params['file_type']={'file_type':'T'};";
		strVar += "reconcile_params['called_type']={'called_type':'1'};";
		strVar += "call_window(reconcile_params);";
		strVar += "    }";
		strVar += "    <\/script>";
		strVar += "    <script>";

		// DOUBLE CLICK // UNMATCH FUNCTIONALITY 
		strVar += "jQuery(document).ready(function(){";
		strVar += "    jQuery(document).delegate('mark', 'click',function(){";
		strVar += "    var html = jQuery(this).text();";
		strVar += "var bill_2_GLOBAL ='';";
		strVar += "var bill_1_GLOBAL ='';";
		strVar += "	var a_new_unmatched_array = new Array();";
		strVar += "var table_id_2 = jQuery(this).attr('id');";
		strVar += "if(table_id_2!=null && table_id_2!=''&& table_id_2!=null)";
		strVar += "{";
		strVar += "var a_split_arr_t = new Array();";
		strVar += "a_split_arr_t = table_id_2.split('_');";
		strVar += "var html_1 = a_split_arr_t[0];";
		strVar += "var html_2 = a_split_arr_t[1];";
		strVar += "html_1 = html_1.replace(/[^.0-9+_]/g, '');";
		strVar += "html_2 = html_2.replace(/[^.0-9+_]/g, '');";
		strVar += "}";
		strVar += "	var a_TT_array_values = new Array();";

		strVar += "	 if(a_unmatch_array!=null && a_unmatch_array!=undefined && a_unmatch_array!='')";
		strVar += "  {";
		strVar += "	      for(var dt=0;dt<a_unmatch_array.length;dt++)";
		strVar += "		  {";
		strVar += "			 	a_TT_array_values = a_unmatch_array.split('][');";
		strVar += "			    break;";
		strVar += "		  }";
		strVar += "	 }";
		strVar += "var a_one_array = new Array();";
		strVar += "var a_two_array = new Array();";
		strVar += "if(a_TT_array_values!=null && a_TT_array_values!=undefined && a_TT_array_values!='')";
		strVar += "{";
		strVar += "	   for(var t_x = 0 ; t_x<a_TT_array_values.length ;t_x++)";
		strVar += "	   {";

		strVar += "	      var a_reconcile_array_2 = a_TT_array_values[t_x];";
		strVar += "	      if(_logValidation(a_reconcile_array_2))";
		strVar += "    	  {";
		strVar += "    	    var a_split_rec_array = new Array();";
		strVar += "    	    a_split_rec_array = a_reconcile_array_2.split('|');";
		strVar += "    	    var i_bill_1_G     = a_split_rec_array[0];";
		strVar += "    	    var i_AP_Line_ID_1 = a_split_rec_array[1];";
		strVar += "    	    var i_unreconcilled_qty_1  = a_split_rec_array[2];";
		strVar += "    	    var i_unreconcilled_original_qty_1  = a_split_rec_array[3];";
		strVar += "    	    var i_table_1 = a_split_rec_array[4];";
		strVar += "    	    var i_unreconciled_qty_id_1  = a_split_rec_array[5];";
		strVar += "    	    var i_bill_2_G  = a_split_rec_array[6];";
		strVar += "    	    var test  = i_bill_2_G.substring(0, 3);";
		strVar += "				if(test == '.ap'){";
		strVar += "    	    var i_bill_1_G     = a_split_rec_array[0];";
		strVar += "    	    i_AP_Line_ID_1 = a_split_rec_array[1];";
		strVar += "    	    i_unreconcilled_qty_1  = -(parseFloat(a_split_rec_array[3]));";
		strVar += "    	    i_unreconcilled_original_qty_1  = -(parseFloat(a_split_rec_array[5]));";
		strVar += "    	    i_table_1 = a_split_rec_array[6];";
		strVar += "    	    i_unreconciled_qty_id_1  = a_split_rec_array[7];";
		strVar += "					i_bill_2_G = a_split_rec_array[8];";
		strVar += "					var i_AP_Line_ID_2 = a_split_rec_array[9];";
		strVar += "					var i_unreconcilled_qty_2 = -(parseFloat(a_split_rec_array[11]));";
		strVar += "					var i_unreconcilled_original_qty_2 = a_split_rec_array[12];";
		strVar += "					var i_table_2 = a_split_rec_array[13];";
		strVar += "					var i_unreconciled_qty_id_2 = a_split_rec_array[14];";
		strVar += "				} else {";
		strVar += "					var i_AP_Line_ID_2 = a_split_rec_array[7];";
		strVar += "					var i_unreconcilled_qty_2 = a_split_rec_array[8];";
		strVar += "					var i_unreconcilled_original_qty_2 = a_split_rec_array[9];";
		strVar += "					var i_table_2 = a_split_rec_array[10];";
		strVar += "					var i_unreconciled_qty_id_2 = a_split_rec_array[11];";
		strVar += "				}";
		strVar += "    	    i_bill_1_G = i_bill_1_G.replace(/[^a-z0-9+_]/g, '');";
		strVar += "    	    i_unreconciled_qty_id_2 = i_unreconciled_qty_id_2.replace(/[^a-z0-9+_.]/g, '');";
		strVar += " if(html_1 == i_bill_1_G)";
		strVar += " {";
		strVar += " if(html_2 == i_bill_2_G)";
		strVar += " {";
		strVar += "bill_2_GLOBAL =i_bill_2_G; ";
		strVar += "bill_1_GLOBAL =i_bill_1_G; ";
		strVar += "i_unreconcilled_qty_1 = i_unreconcilled_qty_1.toString().replace(/minus/i,'|');";
		strVar += "i_unreconcilled_qty_2 = i_unreconcilled_qty_2.toString().replace(/minus/i,'|');";


		strVar += "var s_original_qty_id_1 = i_unreconciled_qty_id_1;";
		strVar += "s_original_qty_id_1 = s_original_qty_id_1.replace('unreconciledquantity', 'quantity');";
		strVar += "var s_original_qty_id_2 = i_unreconciled_qty_id_2;";
		strVar += "s_original_qty_id_2 = s_original_qty_id_2.replace('unreconciledquantity', 'quantity');";

		strVar += "var s_original_item_id_1 = i_unreconciled_qty_id_1;";
		strVar += "s_original_item_id_1 = s_original_item_id_1.replace('unreconciledquantity', 'item');";

		strVar += "var s_original_item_id_2 = i_unreconciled_qty_id_2;";
		strVar += "s_original_item_id_2 = s_original_item_id_2.replace('unreconciledquantity', 'item');";

		strVar += " var original_item_2 = jQuery('.aptable1 td.'+s_original_item_id_2.toString()).text();";
		strVar += " var original_item_1 = jQuery('.table1 td.'+s_original_item_id_1.toString()).text();";

		strVar += "var s_split_arr_1 = new Array(); ";
		strVar += "s_split_arr_1 = original_item_1.split('APLINE_');";
		strVar += "original_item_1 = s_split_arr_1[0];";
		strVar += "var AP_Line_item_1 = s_split_arr_1[1];";

		strVar += "var s_split_arr_2 = new Array(); ";
		strVar += "s_split_arr_2 = original_item_2.split('APLINE_');";
		strVar += "original_item_2 = s_split_arr_2[0];";
		strVar += "var AP_Line_item_2 = s_split_arr_2[1];";
		strVar += "  if((AP_Line_item_1 == i_AP_Line_ID_1) && (AP_Line_item_2 ==i_AP_Line_ID_2 ))";
		strVar += "	{";
		strVar += " var U_qty_1 = jQuery('.table1 td.'+i_unreconciled_qty_id_1.toString()).text();";
		strVar += " if(U_qty_1 == '' || U_qty_1 == null || U_qty_1 == undefined)";
		strVar += " {";
		strVar += " 	U_qty_1 = 0;";
		strVar += " }";
		strVar += " U_qty_1 = parseFloat(U_qty_1)+parseFloat(i_unreconcilled_qty_2);";

		/*    
	strVar += "		i_split_I_1_array = i_item_2_split.split('APLINE_');";	
	strVar += "		var i_item_2 = i_split_I_1_array[0];";		
    */


		strVar += " var original_qty_2 = jQuery('.aptable1 td.'+s_original_qty_id_2.toString()).text();";
		strVar += " var original_qty_1 = jQuery('.table1 td.'+s_original_qty_id_1.toString()).text();";
		strVar += " var U_qty_2 = jQuery('.aptable1 td.'+i_unreconciled_qty_id_2.toString()).text();";
		strVar += " if(U_qty_2 == '' || U_qty_2 == null || U_qty_2 == undefined)";
		strVar += " {";
		strVar += " 	U_qty_2 = 0;";
		strVar += " }";

		strVar += " U_qty_2 = parseFloat(U_qty_2)+parseFloat(i_unreconcilled_qty_1);";

		strVar += "	jQuery('.aptable1 td.'+i_unreconciled_qty_id_2.toString()).text(parseFloat(U_qty_2).toFixed(1));";
		strVar += "	jQuery('.table1 td.'+i_unreconciled_qty_id_1.toString()).text(parseFloat(U_qty_1).toFixed(1));";

		strVar += "if(original_qty_1 == U_qty_1)";
		strVar += "{";
		strVar += "	jQuery('.table1 td.'+i_unreconciled_qty_id_1.toString()).closest('tr').css('color','black');";
		strVar += "}";
		strVar += "else";
		strVar += "{";
		strVar += "	jQuery('.table1 td.'+i_unreconciled_qty_id_1.toString()).closest('tr').css('color','red');";
		strVar += "}";
		strVar += "if(original_qty_2 == U_qty_2)";
		strVar += "{";
		strVar += "	jQuery('.aptable1 td.'+i_unreconciled_qty_id_2.toString()).closest('tr').css('color', 'black');";
		strVar += "}";
		strVar += "else";
		strVar += "{";
		strVar += "if(U_qty_2>0)";
		strVar += "{";
		strVar += "	jQuery('.aptable1 td.'+i_unreconciled_qty_id_2.toString()).closest('tr').css('color', 'red');";
		strVar += "}";
		strVar += "else";
		strVar += "{";
		strVar += "	jQuery('.aptable1 td.'+i_unreconciled_qty_id_2.toString()).closest('tr').css('color', 'black');";
		strVar += "}";
		strVar += "}";
		strVar += "i_unreconcilled_original_qty_1 = i_unreconcilled_original_qty_1.toString().replace(/-/i,'minus');";
		strVar += "i_unreconcilled_qty_1 = i_unreconcilled_qty_1.toString().replace(/-/i,'minus');";
		strVar += "i_unreconcilled_qty_2 = i_unreconcilled_qty_2.toString().replace(/-/i,'minus');";
		strVar += "i_unreconcilled_original_qty_2 = i_unreconcilled_original_qty_2.toString().replace(/-/i,'minus');";
		strVar += "var unmatched_string ='['+i_bill_1_G+'|'+i_AP_Line_ID_1+'|'+i_unreconcilled_qty_1 +'|'+i_unreconcilled_original_qty_1 +'|'+i_table_1 +'|'+i_unreconciled_qty_id_1+'|'+i_bill_2_G+'|'+ i_AP_Line_ID_2+'|'+i_unreconcilled_qty_2 +'|'+i_unreconcilled_original_qty_2 +'|'+i_table_2  +'|'+i_unreconciled_qty_id_2+'|F]';";

		//TESTING
		strVar += "var unmatched_string2 ='['+i_bill_1_G+'|'+i_AP_Line_ID_1+'|'+i_unreconcilled_qty_1 +'|'+i_unreconcilled_original_qty_1 +'|'+i_table_1 +'|'+i_unreconciled_qty_id_1+'|'+i_bill_2_G+'|'+ i_AP_Line_ID_2+'|'+i_unreconcilled_qty_2 +'|'+i_unreconcilled_original_qty_2 +'|'+i_table_2  +'|'+i_unreconciled_qty_id_2+'|T]';";

		strVar += 'console.log(unmatched_string);';

		strVar += "i_unreconcilled_original_qty_1 = i_unreconcilled_original_qty_1.toString().replace(/minus/i,'|');";
		strVar += "i_unreconcilled_qty_1 = i_unreconcilled_qty_1.toString().replace(/minus/i,'|');";
		strVar += "i_unreconcilled_qty_2 = i_unreconcilled_qty_2.toString().replace(/minus/i,'|');";
		strVar += "i_unreconcilled_original_qty_2 = i_unreconcilled_original_qty_2.toString().replace(/minus/i,'|');";

		strVar += " var difference_qty_1 = parseFloat(i_unreconcilled_original_qty_1) - parseFloat(i_unreconcilled_qty_1);";
		strVar += " var difference_qty_2 = parseFloat(i_unreconcilled_original_qty_2) - parseFloat(i_unreconcilled_qty_2);";

		strVar += "difference_qty_1 = parseFloat(difference_qty_1).toFixed(1);";
		strVar += "difference_qty_2 = parseFloat(difference_qty_2).toFixed(1);";

		strVar += "var unmatched_string_tobe_Replaced  ='['+i_bill_1_G+'|'+i_AP_Line_ID_1+'|'+difference_qty_1 +'|'+i_bill_2_G+'|'+ i_AP_Line_ID_2+'|'+difference_qty_2+'|F]';";
		strVar += "var unmatched_string_tobe_Replaced2  ='['+i_bill_1_G+'|'+i_AP_Line_ID_1+'|'+difference_qty_1 +'|'+i_bill_2_G+'|'+ i_AP_Line_ID_2+'|'+difference_qty_2+'|T]';";


		strVar += " var linking_str = '['+i_bill_1_G+'|'+i_bill_2_G+']';";

		strVar += "var result_unmatch_array = a_unmatch_array.indexOf(unmatched_string);";
		strVar += "var result_unmatch_array2 = a_unmatch_array.indexOf(unmatched_string2);";

		strVar += "if(result_unmatch_array > -1 && result_unmatch_array2 == -1){";
		strVar += "a_unmatch_array = a_unmatch_array.replace(unmatched_string, '');";
		strVar += "}";


		strVar += "if(result_unmatch_array2 > -1 && result_unmatch_array == -1){";
		strVar += "a_unmatch_array = a_unmatch_array.replace(unmatched_string2, '');";
		strVar += "}";

		

		strVar += "var result_reconcile_array = a_reconcile_array.indexOf(unmatched_string_tobe_Replaced);";
		strVar += "var result_reconcile_array2 = a_reconcile_array.indexOf(unmatched_string_tobe_Replaced2);";

		strVar += "if(result_reconcile_array > -1 && result_reconcile_array2 == -1){";
		strVar += "a_reconcile_array = a_reconcile_array.replace(unmatched_string_tobe_Replaced, '');";
		strVar += "}";


		strVar += "if(result_reconcile_array2 > -1 && result_reconcile_array == -1){";
		strVar += "a_reconcile_array = a_reconcile_array.replace(unmatched_string_tobe_Replaced2, '');";
		strVar += "}";

		strVar += "a_linking_array = a_linking_array.replace(linking_str, '');";
		strVar += "	jQuery('.tab td.tabtd').text(a_linking_array);";


		strVar += "	}";



		strVar += " }";
		strVar += " }";
		strVar += "    }";
		strVar += "	 }";
		strVar += "}";
		strVar += "var s_current_ID_1 = '.'+bill_1_GLOBAL+' '+' li';";
		strVar += "var index_1 = jQuery(s_current_ID_1).size();";
		strVar += "var s_current_ID_2 = '.'+bill_2_GLOBAL+' '+' li';";
		strVar += "var index_2 = jQuery(s_current_ID_2).size();";
		strVar += "var color_flag = '';";
		strVar += "if(index_1>1)";
		strVar += "{";
		strVar += "    jQuery('.'+bill_1_GLOBAL).closest('td').parents('table:first').removeClass('green').addClass('orange');";
		strVar += "color_flag = 'orange';";
		strVar += "}";
		strVar += "if(index_1 == 1)";
		strVar += "{";
		strVar += "    jQuery('.'+bill_1_GLOBAL).closest('td').parents('table:first').removeClass('orange').addClass('white');";
		strVar += "color_flag = 'white';";
		strVar += "}";
		strVar += "if(index_2>1)";
		strVar += "{";
		strVar += "    jQuery('.'+bill_2_GLOBAL).closest('td').parents('table:first').removeClass('green').addClass('orange');";
		strVar += "}";
		strVar += "if(index_2 == 1)";
		strVar += "{";
		strVar += "    jQuery('.'+bill_2_GLOBAL).closest('td').parents('table:first').removeClass('orange').addClass('white');";
		strVar += "}";
		//////////////////////
		strVar += "if(a_unauthorized_array!=null && a_unauthorized_array!= '' && a_unauthorized_array!= 'undefined')";
		strVar += "{";
		strVar += "var a_split_arr_T = new Array();";
		strVar += " for(var t_1 = 0 ;t_1<a_unauthorized_array.length ;t_1++)";
		strVar += " {";
		strVar += "  a_split_arr_T =  a_unauthorized_array.split(',');";
		strVar += " }";
		strVar += "if(a_split_arr_T!=null && a_split_arr_T!= '' && a_split_arr_T!= 'undefined')";
		strVar += " {";
		strVar += "var a_split_arr_U = new Array();";
		strVar += " for(var t_2 = 0 ;t_2<a_split_arr_T.length ;t_2++)";
		strVar += " {";
		strVar += "  a_split_arr_U =  a_split_arr_T[t_2].split('|');";
		strVar += " var i_bill_ID_U = a_split_arr_U[0];";
		strVar += " var i_item_U = a_split_arr_U[1];";
		strVar += " var i_quantity_U = a_split_arr_U[2];";
		strVar += "if(html_1 == i_bill_ID_U)";
		strVar += " {";
		strVar += " if(color_flag == 'white' && i_quantity_U == 0)";
		strVar += " {";
		strVar += "    jQuery('.'+bill_1_GLOBAL).closest('td').parents('table:first').removeClass('white').addClass('orange');";
		strVar += " }";
		strVar += " if(color_flag == 'orange' && i_quantity_U > 0)";
		strVar += " {";
		strVar += " }";
		strVar += " }";
		strVar += " }";
		strVar += " }";
		strVar += " }";
		/////////////////
		strVar += " jQuery(this).remove();";
		strVar += "console.log('unmatch array' + a_unmatch_array);";
		strVar += "console.log('reconcile array' + a_reconcile_array);";
		strVar += " if(i_unreconciled_qty_id_2.indexOf('approduct') >-1)";
		strVar += " {";
		strVar += " var product_ID_S = '.'+bill_2_GLOBAL+' '+'li:contains('+bill_1_GLOBAL+')';";
		strVar += "jQuery(product_ID_S).remove()";
		strVar += " }";
		strVar += " if(i_unreconciled_qty_id_1.indexOf('apbill') >-1)";
		strVar += " {";
		strVar += " var bill_ID_S = '.'+bill_1_GLOBAL+' '+'li:contains('+bill_2_GLOBAL+')';";
		strVar += "jQuery(bill_ID_S).remove()";
		strVar += " }";
		strVar += "    });";
		strVar += "});";
		strVar += "    <\/script>";
		// ADDED CODE FOR JUMPER CLASS FOR AP BILL 
		strVar += "<script type='text\/javascript'>";
		// ADDED CODE FOR AP BILL TABLE 
		strVar += "jQuery(document).ready(function() ";
		strVar += "{";
		strVar += "    jQuery(document).delegate('.jumper', 'click',function(){";
		strVar += "	   var id = jQuery(this).attr('id');";
		strVar += "       var html = jQuery(this).html();  ";
		strVar += "       if(_logValidation(html))"
		strVar += "       {"
		strVar += "         var html_split = html.toString().split('#:');"
		strVar += "         var id = html_split[1].replace(/[^.0-9]/g,'');"
		strVar += "       }"
		strVar += "	    jQuery('#'+id)[0].scrollIntoView(true); ";
		strVar += "	  });";
		strVar += "});";

		// ADDED CODE FOR AP PRODUCT  TABLE

		strVar += "jQuery(document).ready(function() ";
		strVar += "		{";
		strVar += "    jQuery(document).delegate('.jumper_product', 'click',function(){";
		strVar += "	   var id = jQuery(this).attr('id');";
		strVar += "            	var html = jQuery(this).html();  ";
		strVar += " if(_logValidation(html))"
		strVar += "{"
		strVar += "  var html_split = html.toString().split('(');"
		strVar += "  var id = html_split[1].replace(/[^.0-9]/g,'');"
		strVar += " }"
			//strVar += "	   var obj_tb = jQuery('.aptable11111').attr('id');";
			//strVar += "	   alert('html id-->'+id);";
			//strVar += "	  jQuery('.'+id)[0].scrollIntoView(true); ";
		strVar += "	  jQuery('table [data-name='+id+']')[0].scrollIntoView(true); ";

		strVar += "	  });";
		strVar += "});";

		strVar += "    <\/script>";


		// END TO ADDED CODE FOR JUMPER CALSS IN TABLE 2 


		strVar += " <script type=\"text\/javascript\">";
		//	strVar += "jQuery(document).ready(function(){";	
		//	strVar += "    jQuery(document).delegate('apply', 'click',function(){";	

		strVar += "function apply(e){;";


		//	strVar += " e.preventDefault();";
		//	strVar += " e.stopPropagation();";


		//	strVar += " e.preventDefault();";
		//strVar += "alert('Date Clicked...');";

		//strVar += "return false;"; 


		strVar += "var flag  = 0 ;";
		strVar += "   var d_bill_from_date = jQuery('#ap_bill_from_date').val();";
		strVar += "   var d_bill_to_date = jQuery('#ap_bill_to_date').val();";
		strVar += "   var d_product_from_date = jQuery('#ap_product_from_date').val();";
		strVar += "   var d_product_to_date = jQuery('#ap_product_to_date').val();";


		strVar += "if(d_bill_from_date!=null && d_bill_from_date!=''&&d_bill_from_date!=undefined)";
		strVar += "{";
		strVar += "if(d_bill_to_date == null || d_bill_to_date == ''|| d_bill_to_date == undefined)";
		strVar += "{";
		strVar += "alert('Please enter required dates in From & To Date.');";
		//	strVar += "window.location.reload(false);";

		//strVar += " e.preventDefault();";
		//strVar += " e.stopPropagation();";


		//strVar += " e.preventDefault();";
		//strVar += "window.stop();"; 
		//strVar += "return false;"; 
		strVar += "}";
		strVar += "}";

		strVar += "if(d_bill_to_date!=null && d_bill_to_date!=''&&d_bill_to_date!=undefined)";
		strVar += "{";
		strVar += "if(d_bill_from_date == null || d_bill_from_date == ''|| d_bill_from_date == undefined)";
		strVar += "{";
		strVar += "alert('Please enter required dates in From & To Date.');";
		//strVar += "return false;"; 
		strVar += "}";
		strVar += "}";

		strVar += "if(d_product_from_date!=null && d_product_from_date!=''&& d_product_from_date!=undefined)";
		strVar += "{";
		strVar += "if(d_product_to_date == null || d_product_to_date == ''|| d_product_to_date == undefined)";
		strVar += "{";
		strVar += "alert('Please enter required dates in From & To Date.');";
		//strVar += "return false;"; 
		strVar += "}";
		strVar += "}";

		strVar += "if(d_product_to_date!=null && d_product_to_date!=''&&d_product_to_date!=undefined)";
		strVar += "{";
		strVar += "if(d_product_from_date == null || d_product_from_date == ''|| d_product_from_date == undefined)";
		strVar += "{";
		strVar += "alert('Please enter required dates in From & To Date.');";
		//strVar += "return false;"; 
		strVar += "}";
		strVar += "}";


		/*
	strVar += "if(d_product_to_date!=null && d_product_to_date!=''&&d_product_to_date!=undefined && d_product_from_date!=null && d_product_from_date!=''&& d_product_from_date!=undefined)";
	strVar += "{";
	  strVar += "alert('P 1 .....');";
	strVar += " flag  = 1 ;"; 
	strVar += "}"; 
	strVar += "else if(d_bill_to_date != null && d_bill_to_date != ''&&d_bill_to_date != undefined && d_bill_from_date != null && d_bill_from_date != ''&& d_bill_from_date != undefined)";
    strVar += "{";
    strVar += "alert('P 2 .....');";
	strVar += " flag  = 1 ;"; 
	strVar += "}"; 
	
	strVar += "else if((d_product_to_date == null || d_product_to_date == '' || d_product_to_date == undefined) && (d_product_from_date == null || d_product_from_date == '' || d_product_from_date == undefined))";
	strVar += "{";
	  strVar += "alert('P 3 .....');";
	strVar += " flag  = 1 ;"; 
	strVar += "}"; 
	strVar += "else if((d_bill_to_date == null || d_bill_to_date =='' || d_bill_to_date == undefined) &&( d_bill_from_date == null || d_bill_from_date == '' || d_bill_from_date == undefined))";
    strVar += "{";
    strVar += "alert('Bill .....');";
	strVar += " flag  = 1 ;"; 
	strVar += "}"; 
	*/



		//strVar += "if(flag == 1)"; 
		strVar += "{";
		strVar += "if(a_reconcile_array!=null && a_reconcile_array!=''&&a_reconcile_array!=undefined)";
		strVar += "{";
		strVar += "   a_reconcile_array = a_reconcile_array.toString();     ";
		strVar += "}";
		// TO SEND DATA TO RECONCILE LINK 
		strVar += "   a_linking_array = a_linking_array.toString();";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";
		strVar += "   var a_unmatch_array_beforeload = '" + s_unmatch_content_ui + "';";
		strVar += "   var reconcile_Array_before_Load = '" + reconcile_Array_before_Load + "';";
		strVar += "   a_unmatch_array_GLOBAL = a_unmatch_array_GLOBAL.toString();";

		strVar += "var blank_V = '';";
		strVar += "   var i_partner = '" + i_partner + "';";

		strVar += "reconcile_params['reconcile_array']={'reconcile_array':a_reconcile_array};";
		strVar += "reconcile_params['a_linking_array']={'a_linking_array':a_linking_array};";
		strVar += "reconcile_params['a_unmatch_array_GLOBAL']={'a_unmatch_array_GLOBAL':a_unmatch_array_GLOBAL};";
		strVar += "reconcile_params['a_unmatch_array']={'a_unmatch_array':a_unmatch_array};";
		strVar += "reconcile_params['a_unmatch_array_beforeload']={'a_unmatch_array_beforeload':a_unmatch_array_beforeload};";
		strVar += "reconcile_params['d_bill_from_date']={'d_bill_from_date':d_bill_from_date};";
		strVar += "reconcile_params['d_bill_to_date']={'d_bill_to_date':d_bill_to_date};";
		strVar += "reconcile_params['d_product_from_date']={'d_product_from_date':d_product_from_date};";
		strVar += "reconcile_params['d_product_to_date']={'d_product_to_date':d_product_to_date};";
		strVar += "reconcile_params['a_cancel_array']={'a_cancel_array':blank_V};";
		strVar += "reconcile_params['a_confirm_array']={'a_confirm_array':blank_V};";
		strVar += "reconcile_params['a_deliver_array']={'a_deliver_array':blank_V};";
		strVar += "reconcile_params['reconcile_Array_before_Load']={'reconcile_Array_before_Load':reconcile_Array_before_Load};";
		strVar += "reconcile_params['partner']={'partner':i_partner};";
		strVar += "reconcile_params['called_type']={'called_type':''};";



		strVar += "call_window(reconcile_params);";
		//strVar += "    window.open('https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=603&deploy=1&custscript_reconcile_array='+a_reconcile_array+'&custscript_linking_array='+a_linking_array+'&custscript_unmatched_array='+a_unmatch_array_GLOBAL+'&a_unmatch_array='+a_unmatch_array+'&a_unmatch_array_beforeload_to='+a_unmatch_array_beforeload+'&a_reconcile_array_beforeload_to='+reconcile_Array_before_Load+'&ap_bill_from_date='+d_bill_from_date+'&ap_bill_to_date='+d_bill_to_date+'&ap_product_from_date='+d_product_from_date+'&ap_product_to_date='+d_product_to_date);";
		//strVar += "   window.close();   ";	
		strVar += "}";

		strVar += "    }";
		strVar += "    <\/script>";



		strVar += "<script type='text\/javascript'>";
		//strVar += "  jQuery(document).ready(function(){alert('Welcome to Product Reconcilliation Page.')});";
		strVar += " var i_bill_1_G ;";
		strVar += " var i_bill_2_G ;";
		strVar += " var i_lines_1_G ;";
		strVar += " var i_lines_2_G ;";
		strVar += " var i_index_1_G ;";
		strVar += " var i_index_2_G ;";
		strVar += " var i_billTable ;";
		strVar += "var i_dropped = 'NO';";
		strVar += " var dragged_count = 0 ;";
		strVar += "var negative_not_allow = 'NO';";

		strVar += " var i_status_1_G ;";
		strVar += " var i_status_2_G ;";
		strVar += " var allowdrag = 0 ;";
		strVar += " var Customer_displayed  = 0 ;";
		var my_user = nlapiGetUser();
		// DRAGGABLE CODE START 
		strVar += " jQuery(function () {";
		strVar += " 	try{";
		strVar += "    jQuery('.drag_td').draggable({";
		strVar += "        revert: 'valid',";
		strVar += "  cursor: 'pointer',";
		strVar += " helper: 'clone',";
		strVar += "        refreshPositions: true,";
		strVar += "        drag: function (event, ui) {";
		strVar += "            ui.helper.addClass('draggable');";
		strVar += "        },";
		strVar += "         stop: function (event, ui) {";
		strVar += "				try{";
		// THIS FUNCTION ALLOW TO DRAG AND DROP THE ITEM 

		strVar += "if(allowdrag == 1)";
		strVar += "{"
			//	strVar += "         	ui.helper.removeClass('draggable');";
		strVar += "            	var html = jQuery(this).html();  ";
		// strVar += "     alert('drag called -->:');";
		strVar += " 		allowdrag = 0 ;";
		strVar += "            	var parTr = jQuery(this).closest('td');";
		strVar += "            	var table_id_2 = jQuery(parTr).attr('id');";
		strVar += " 			var i_bill_no_split_2 = new Array();";
		strVar += " 			var i_bill_no_split_2_2 = new Array();";
		strVar += " 			var i_bill_no_split_2_2_2 = new Array();";
		strVar += "	 			i_bill_no_split_2 = table_id_2.split('approductno');";
		strVar += "	 			var i_bill_no_2 = i_bill_no_split_2[0];";
		strVar += "	 			var i_lines_2_split = i_bill_no_split_2[1];";
		strVar += "				i_bill_no_split_2_2 = i_lines_2_split.split('index');";
		strVar += "				var i_lines_2 = i_bill_no_split_2_2[0];";
		strVar += "				var i_index_2_split = i_bill_no_split_2_2[1];";
		strVar += "				i_bill_no_split_2_2_2 = i_index_2_split.split('status');";
		strVar += "				var i_index_2 = i_bill_no_split_2_2_2[0];";
		strVar += "				var i_status_2 = i_bill_no_split_2_2_2[1];";
		strVar += "     		i_lines_2 = i_lines_2.replace(\/[^0-9\.]+\/g, \"\");";

		strVar += " 	i_bill_2_G = i_bill_no_2; ";
		strVar += " 		i_lines_2_G = i_lines_2; ";
		strVar += " 		i_index_2_G = i_index_2; ";
		strVar += " 		i_status_2_G = i_status_2; ";
		//	strVar +="alert('Dropped Bill -->'+i_dropped);";	
		strVar += " 	if(i_bill_2_G!=null && i_bill_2_G!=undefined && i_bill_2_G!='' &&i_bill_1_G!=null && i_bill_1_G!=undefined && i_bill_1_G!='')";
		strVar += " 	{";
		strVar += "   if(i_dropped == 'YES')";
		strVar += " 	 {";
		strVar += " 	 	dragged_count = dragged_count + 1;";
		strVar += "      if(dragged_count <= 20)";
		strVar += "      {";
		strVar += "     		alert('Match-up #: '+ dragged_count +'\\n\\nAP Product Order #:'+i_bill_2_G+' is dragged onto AP Bill #:'+i_bill_1_G);";
		strVar += " 	 	}";
		strVar += " 	 	else {";
		strVar += "     		alert('The 20 Match-up limit has been exceeded.\\n\\nThis page will now automatically Reconcile.\\n\\nReconciliation process may take up to a few minutes to complete with which a blank white screen will pop-up whilst the process is taking place.\\n\\nDO NOT CLOSE ANY WINDOWS or TABS.\\nClosing any of these might result in you needing to re-do your reconciliation\\n\\nPlease click \"OK\" or close this alert to continue.');";
		strVar += " 	 		createInput();";
		strVar += " 	    }";
		strVar += " 	 }";
		strVar += " 	}";
		strVar += "      var a_item_1_arr = new Array();";
		strVar += "      var a_item_2_arr = new Array();";

		strVar += "      var a_AP_Bill_1_arr = new Array();";
		strVar += "      var a_AP_Product_2_arr = new Array();";

		strVar += " 		var table_2 = '.apitemtable_'+i_index_2_G;";
		strVar += " 		var table_1 = '.apbillitemtable_'+i_index_1_G;";
		strVar += "		var main_table_1 = '.table1';";
		strVar += "		var main_table_2 = '.aptable1';";
		strVar += "		var i_cnt = 0 ;"
		strVar += "		var i_vnt = 0 ;"
		strVar += "		var a_bill_arr_1_C = new Array();";
		strVar += "		var a_bill_arr_2_C = new Array();";
		strVar += "		var duplicates_array = new Array() ;"
		strVar += "		var item_duplicate_array = new Array();"

		strVar += "		var item_duplicate_array_bill = new Array() ;"

		strVar += "		for(var l_g_1 = 0 ; l_g_1<i_lines_2_G ; l_g_1++){";

		strVar += "     var i_temp_qty_original_1 = 0;";
		strVar += "     var i_temp_qty_original_2 = 0;";
		strVar += " 	i_cnt = parseFloat(l_g_1)+parseFloat(1) ;"
		strVar += "		var item_id_2 = i_cnt+'_'+'approductitem'+'_'+i_bill_2_G;";
		strVar += "		var quantity_id_2 = i_cnt+'_'+'approductquantity'+'_'+i_bill_2_G;";
		strVar += "		var unreconciledquantity_id_2 = i_cnt+'_'+'approductunreconciledquantity'+'_'+i_bill_2_G;";
		strVar += "		var i_quantity_2  = jQuery(table_2+' td.'+quantity_id_2).text();";
		strVar += "		var i_split_I_1_array = new Array(); ";
		strVar += "		var i_item_2_split  = jQuery(table_2+' td.'+item_id_2).text();";
		strVar += "		i_split_I_1_array = i_item_2_split.split('APLINE_');";
		strVar += "		var i_item_2 = i_split_I_1_array[0];";
		strVar += "		var i_div_2 = i_split_I_1_array[1];";
		strVar += "		var i_unreconcilled_qty_2  = jQuery(table_2+' td.'+unreconciledquantity_id_2).text();";
		strVar += "		  	for(var l_g_k = 0 ; l_g_k<i_lines_1_G ; l_g_k++){";
		strVar += "     	  i_vnt = parseFloat(l_g_k)+parseFloat(1) ;"
		strVar += "					var item_id_1 = i_vnt+'_'+'apbillitem'+'_'+i_bill_1_G;";
		strVar += "		   			var quantity_id_1 = i_vnt+'_'+'apbillquantity'+'_'+i_bill_1_G;";
		strVar += "		   			var unreconciledquantity_id_1 = i_vnt+'_'+'apbillunreconciledquantity'+'_'+i_bill_1_G;";
		strVar += "		   			var i_quantity_1  = jQuery(table_1+' td.'+quantity_id_1).text();";
		strVar += "		   			var i_split_I_array = new Array(); ";
		strVar += "		   			var i_item_1_split  = jQuery(table_1+' td.'+item_id_1).text();";
		strVar += "					i_split_I_array = i_item_1_split.split('APLINE_');";
		strVar += "					var i_item_1 = i_split_I_array[0];";
		strVar += "					var i_div_1 = i_split_I_array[1];";
		strVar += "		   			var i_unreconcilled_qty_1  = jQuery(table_1+' td.'+unreconciledquantity_id_1).text();";

		//if(my_user == 460062)
		{
			//	strVar += "alert('i_item_1'+i_item_1);";
			//	strVar += "alert('i_item_2'+i_item_2);";
			//	strVar += "alert('i_unreconcilled_qty_1 Float '+parseFloat(i_unreconcilled_qty_1));";
			strVar += "if(parseFloat(i_unreconcilled_qty_1) < 0 && (i_item_1 == i_item_2) && parseFloat(i_unreconcilled_qty_2) < 0)";
			strVar += "{";
			strVar += "negative_not_allow = 'YES';";
			strVar += "break;";
			strVar += "};";

			//	strVar += "alert('i_unreconcilled_qty_2'+i_unreconcilled_qty_2);";
		}
		strVar += "	if((i_item_1 == i_item_2) ){";
		strVar += " var item_chk = a_item_1_arr.indexOf(i_item_1);";
		strVar += "if(item_chk >-1 )";
		strVar += "{";
		strVar += " try";
		strVar += " {";
		strVar += "	var i_remaining_qty_CHK = item_duplicate_array[i_item_1-i_bill_1_G].quantity_it;";
		strVar += "	var i_remaining_qty_bill_CHK = item_duplicate_array_bill[i_item_1-i_bill_2_G].quantity_it_bill;";

		//strVar += "		i_unreconcilled_qty_1 = i_remaining_qty_bill_CHK;";		
		strVar += "		i_unreconcilled_qty_2 = i_remaining_qty_CHK;";

		//	strVar += "alert('Unreconcilled Qty 1 -->'+i_unreconcilled_qty_1+'Unreconcilled Qty 2 -->'+i_unreconcilled_qty_2);";

		strVar += "	 }";
		strVar += " catch(www)";
		strVar += " {";
		//strVar += " alert('Error When Item is same -->'+www);";
		strVar += "	 }";
		strVar += "	}";

		//	strVar += "alert('<<<<<<<< i_unreconcilled_qty_1 >>>>>>'+i_unreconcilled_qty_1);";
		//	strVar += "alert('<<<<<<<< i_unreconcilled_qty_2 >>>>>>'+i_unreconcilled_qty_2);";

		strVar += " 	var i_temp_qty = parseFloat(i_unreconcilled_qty_1)-parseFloat(i_unreconcilled_qty_2);";
		strVar += " 	i_temp_qty_original_1 =i_unreconcilled_qty_1; ";
		strVar += "	if(i_temp_qty<0){";
		strVar += "	 i_temp_qty = 0 ;";
		strVar += "	}";
		strVar += "	var i_temp_qty_2 = parseFloat(i_unreconcilled_qty_2) - parseFloat(i_unreconcilled_qty_1);";
		strVar += "	i_temp_qty_original_2 =i_unreconcilled_qty_2; ";
		strVar += "	if(i_temp_qty_2<0){";
		strVar += "	i_temp_qty_2 = 0 ;";
		strVar += "	}";
		strVar += "if((i_item_1 == i_item_2))";
		strVar += "{";
		strVar += "item_duplicate_array[i_item_1-i_bill_1_G]={'quantity_it':i_temp_qty_2};";
		strVar += "item_duplicate_array_bill[i_item_1-i_bill_2_G]={'quantity_it_bill':i_temp_qty};";
		strVar += "}";
		strVar += "if((i_item_1 == i_item_2) && (item_chk > -1) && (i_remaining_qty_CHK == 0 || i_remaining_qty_CHK<0))";
		strVar += "{";
		//	strVar += "	 alert('Duplicates found...');";
		strVar += "	 duplicates_array.push(i_item_1);";
		strVar += "}";

		strVar += "var duplicate_check = duplicates_array.indexOf(i_item_1);";

		strVar += "	if(duplicate_check == -1)";
		strVar += "	{";


		//	strVar += "alert('Temp Qty 1 -->'+i_temp_qty+'Temp Qty 2 -->'+i_temp_qty_2);";


		strVar += "	jQuery(table_2+' td.'+unreconciledquantity_id_2).text(parseFloat(i_temp_qty_2).toFixed(1));";
		strVar += "	jQuery(table_1+' td.'+unreconciledquantity_id_1).text(parseFloat(i_temp_qty).toFixed(1));";

		strVar += "	if(i_temp_qty>0)";
		strVar += "	{";
		strVar += "			jQuery(table_1+' td.'+unreconciledquantity_id_1).closest('tr').css('color', 'red');";
		strVar += "	}";
		strVar += "	else";
		strVar += "	{";
		strVar += "			jQuery(table_1+' td.'+unreconciledquantity_id_1).closest('tr').css('color', 'green');";
		strVar += "	}";
		strVar += "	if(i_temp_qty_2>0)";
		strVar += "	{";
		strVar += "			jQuery(table_2+' td.'+unreconciledquantity_id_2).closest('tr').css('color', 'red');";
		strVar += "	}";
		strVar += "	else";
		strVar += "	{";
		strVar += "			jQuery(table_2+' td.'+unreconciledquantity_id_2).closest('tr').css('color', 'green');";
		strVar += "	}";
		strVar += " var difference_1 = parseFloat(i_temp_qty_original_1)-parseFloat(i_temp_qty);";
		strVar += " var difference_2 = parseFloat(i_temp_qty_original_2)-parseFloat(i_temp_qty_2);";
		strVar += "difference_1 = parseFloat(difference_1).toFixed(1);";
		strVar += "difference_2 = parseFloat(difference_2).toFixed(1);";

		strVar += "i_temp_qty_original_1 = parseFloat(i_temp_qty_original_1).toFixed(1);";
		strVar += "i_temp_qty_original_2 = parseFloat(i_temp_qty_original_2).toFixed(1);";

		strVar += "i_temp_qty = parseFloat(i_temp_qty).toFixed(1);";
		strVar += "i_temp_qty_2 = parseFloat(i_temp_qty_2).toFixed(1);";

		strVar += "	a_reconcile_array +='['+i_bill_1_G+'|'+i_div_1+'|'+i_temp_qty+'|'+i_bill_2_G+'|'+ i_div_2+'|'+i_temp_qty_2+'|T]';";

		// MAKE UNMATCH ARRAY 
		strVar += "	a_unmatch_array +='['+i_bill_1_G+'|'+i_div_1+'|'+difference_1 +'|'+i_temp_qty_original_1 +'|'+table_1 +'|'+unreconciledquantity_id_1+'|'+i_bill_2_G+'|'+ i_div_2+'|'+difference_2 +'|'+i_temp_qty_original_2 +'|'+table_2  +'|'+unreconciledquantity_id_2+'|T]';";

		strVar += "console.log(a_unmatch_array);";
		strVar += "console.log(a_reconcile_array);";


		strVar += "	a_unmatch_array_GLOBAL +='['+i_bill_1_G+'|'+difference_1+'|'+i_index_1_G +'|'+i_vnt+'|'+i_bill_2_G+'|'+difference_2+'|'+i_index_2_G  +'|'+i_cnt+']';";

		strVar += "var data_x =	'['+i_bill_1_G+'|'+i_bill_2_G+']';";

		strVar += "var result_w = a_linking_array.indexOf(data_x);";

		strVar += "if(result_w == -1)";
		strVar += "{";
		strVar += "	a_linking_array +='['+i_bill_1_G+'|'+i_bill_2_G+']';";
		strVar += "}";

		strVar += "	a_bill_arr_1_C.push(i_temp_qty);";
		strVar += "	a_bill_arr_2_C.push(i_temp_qty);";
		strVar += " a_item_1_arr.push(i_item_1); ";
		strVar += " a_item_2_arr.push(i_item_2); ";


		strVar += "}";


		///////////////////////////////////////////////////////////////////////////
		strVar += "	}";

		strVar += "	if((i_item_1 == i_item_2) && (i_status_2_G == 7)){";
		strVar += "	var i_temp_qty = parseFloat(i_unreconcilled_qty_1)-parseFloat(i_unreconcilled_qty_2);";
		strVar += "	i_temp_qty_original_1 =i_unreconcilled_qty_1; ";


		//		if(my_user == 460062)
		{
			//		strVar += "alert('i_unreconcilled_qty_1 ** '+i_unreconcilled_qty_1);";
		}



		strVar += "i_temp_qty = parseFloat(i_temp_qty).toFixed(1);";
		strVar += "	jQuery(table_1+' td.'+unreconciledquantity_id_1).text(i_temp_qty);";

		strVar += "	if(i_temp_qty>0)";
		strVar += "	{";
		strVar += "		jQuery(table_1+' td.'+unreconciledquantity_id_1).closest('tr').css('color', 'red');";
		strVar += "	}";
		strVar += "	else";
		strVar += "	{";
		strVar += "		jQuery(table_1+' td.'+unreconciledquantity_id_1).closest('tr').css('color', 'green');";
		strVar += "	}";

		//   strVar += "alert('i_unreconcilled_qty_1 1 -->'+i_unreconcilled_qty_1);";		
		//	strVar += "alert('i_unreconcilled_qty_2 2 -->'+i_unreconcilled_qty_2);";		


		strVar += "	var i_temp_qty_2 = parseFloat(i_unreconcilled_qty_2) + parseFloat(i_unreconcilled_qty_1);";
		strVar += "	i_temp_qty_original_2 =i_unreconcilled_qty_2; ";

		//	strVar += "alert('i_temp_qty_2 2 -->'+i_temp_qty_2);";

		//	strVar += "	if(i_temp_qty_2<0)";
		strVar += "{";
		strVar += "	i_temp_qty_2 = 0 ;";
		strVar += "}";

		strVar += "i_temp_qty_2 = parseFloat(i_temp_qty_2).toFixed(1);";

		strVar += " jQuery(table_2+' td.'+unreconciledquantity_id_2).text(i_temp_qty_2);";

		//	strVar += "alert('Temp Qty 1 -->'+i_temp_qty);";

		//	strVar += "alert('Temp Qty 2 -->'+i_temp_qty_2);";


		strVar += "	if(i_temp_qty_2>0)";
		strVar += "	{";
		strVar += "			jQuery(table_2+' td.'+unreconciledquantity_id_2).closest('tr').css('color', 'red');";
		strVar += "	}";
		strVar += "	else";
		strVar += "	{";
		strVar += "			jQuery(table_2+' td.'+unreconciledquantity_id_2).closest('tr').css('color', 'green');";
		strVar += "	}";
		strVar += "var difference_1 = parseFloat(i_temp_qty_original_1)-parseFloat(i_temp_qty);";
		strVar += "var difference_2 = parseFloat(i_temp_qty_original_2)-parseFloat(i_temp_qty_2);";
		strVar += "i_temp_qty = parseFloat(i_temp_qty).toFixed(1);"
		strVar += "i_temp_qty_2 = parseFloat(i_temp_qty_2).toFixed(1);"
		strVar += "	a_reconcile_array +='['+i_bill_1_G+'|'+i_div_1+'|'+i_temp_qty+'|'+i_bill_2_G+'|'+ i_div_2+'|'+i_temp_qty_2+'|T]';";
		strVar += "var f_minus = difference_1.toString().indexOf('|');";

		strVar += "if(f_minus>-1)";
		strVar += "{";
		strVar += "difference_1 = difference_1.toString().replace(/-/i,'minus');";
		strVar += "}";

		strVar += "var f_minus = difference_2.toString().indexOf('|');";

		strVar += "if(f_minus>-1)";
		strVar += "{";
		strVar += "difference_2 = difference_2.toString().replace(/-/i,'minus');";
		strVar += "}";


		strVar += "var f_minus = i_temp_qty_original_2.toString().indexOf('|');";

		strVar += "if(f_minus>-1)";
		strVar += "{";
		strVar += "i_temp_qty_original_2 = i_temp_qty_original_2.toString().replace(/-/i,'minus');";
		strVar += "}";

		strVar += "	a_unmatch_array +='['+i_bill_1_G+'|'+i_div_1+'|'+difference_1 +'|'+i_temp_qty_original_1 +'|'+table_1 +'|'+unreconciledquantity_id_1+'|'+i_bill_2_G+'|'+i_div_2+'|'+difference_2 +'|'+i_temp_qty_original_2 +'|'+table_2+'|'+unreconciledquantity_id_2+'|T]';";

		strVar += "	a_unmatch_array_GLOBAL +='['+i_bill_1_G+'|'+difference_1+'|'+i_index_1_G +'|'+i_vnt+'|'+i_bill_2_G+'|'+difference_2+'|'+i_index_2_G  +'|'+i_cnt+']';";

		//strVar += "	a_unmatch_array +='['+i_bill_1_G+'|'+i_div_1+'|'+difference_1 +'|'+i_temp_qty_original_1 +'|'+table_1 +'|'+unreconciledquantity_id_1+'|'+i_bill_2_G+'|'+ i_div_2+'|'+difference_2 +'|'+i_temp_qty_original_2+'|'+table_2  +'|'+unreconciledquantity_id_2+']';";
		//strVar += "	a_unmatch_array_GLOBAL +='['+i_bill_1_G+'|'+difference_1+'|'+i_index_1_G +'|'+i_vnt+'|'+i_bill_2_G+'|'+difference_2+'|'+i_index_2_G  +'|'+i_cnt+']';";

		strVar += "	a_linking_array +='['+i_bill_1_G+'|'+i_bill_2_G+']';";
		strVar += "	a_bill_arr_1_C.push(i_temp_qty);";
		strVar += "	a_bill_arr_2_C.push(i_temp_qty);";
		strVar += " a_item_1_arr.push(i_item_1); ";
		strVar += " a_item_2_arr.push(i_item_2); ";



		strVar += "			}";
		strVar += "		}";
		strVar += "	if(a_reconcile_array!=null && a_reconcile_array!=''&& a_reconcile_array!=undefined){";
		// strVar += "	jQuery('.tab td.tabtd').text(a_reconcile_array);";	
		strVar += "	jQuery('.tab td.tabtd').text(a_reconcile_array);";
		strVar += "		}";


		strVar += "if(negative_not_allow == 'YES')";
		strVar += "{";
		strVar += "negative_not_allow = 'YES';";
		strVar += "break;";
		strVar += "};";
		strVar += "	 }";
		strVar += "    	var poTbl = jQuery(this).closest('td').parents('table:first');";
		strVar += "  	var poTbl_2 = jQuery(this).closest('td').parents('table:first');";
		strVar += "			var i_cnt_A = 0 ;"
		strVar += "			var i_vnt_A = 0 ;"
		strVar += "			var a_fully_reconciled_arr_2 = new Array();";
		strVar += "			var a_partial_reconciled_arr_2 = new Array();";
		strVar += "	 if((i_lines_1_G!=null && i_lines_1_G!=undefined && i_lines_1_G!='') && (i_lines_2_G!=null && i_lines_2_G!=undefined && i_lines_2_G!=''))";
		strVar += "	 {";
		strVar += "			for(var q_x_1 = 0 ; q_x_1<i_lines_2_G ; q_x_1++){";
		strVar += "         	i_cnt_A = parseFloat(q_x_1)+parseFloat(1) ;"
		strVar += "	  			var item_id_2 = i_cnt_A+'_'+'approductitem'+'_'+i_bill_2_G;";
		strVar += "	  			var quantity_id_2 = i_cnt_A+'_'+'approductquantity'+'_'+i_bill_2_G;";
		strVar += "	  			var unreconciledquantity_id_2 = i_cnt_A+'_'+'approductunreconciledquantity'+'_'+i_bill_2_G;";
		strVar += "	 			var i_quantity_2  = jQuery(table_2+' td.'+quantity_id_2).text();";
		strVar += "	  			var i_split_I_1_array = new Array(); ";
		strVar += "   			var i_item_2_split  = jQuery(table_2+' td.'+item_id_2).text();";
		strVar += "   			i_split_I_1_array = i_item_2_split.split('APLINE_');";
		strVar += "	  			var i_item_2 = i_split_I_1_array[0];";
		strVar += "	  			var i_div_2 = i_split_I_1_array[1];";
		strVar += "	  			var i_unreconcilled_qty_2  = jQuery(table_2+' td.'+unreconciledquantity_id_2).text();";
		strVar += "				if(i_unreconcilled_qty_2  == 0){";
		strVar += "				a_fully_reconciled_arr_2.push(i_unreconcilled_qty_2);";
		strVar += "	}";
		strVar += "	else";
		strVar += "	{";
		strVar += "	a_partial_reconciled_arr_2.push(i_unreconcilled_qty_2);";
		strVar += "	}";
		strVar += "	if(a_fully_reconciled_arr_2!=null && a_fully_reconciled_arr_2!= '' && a_fully_reconciled_arr_2!=undefined){";
		strVar += "		if(a_fully_reconciled_arr_2.length == i_lines_2_G){";
		strVar += "	a_AP_Bill_1_arr.push(i_bill_2_G);";
		//	strVar += "alert('i_status_2_G -->'+i_status_2_G);";
		// strVar += "    jQuery(this).closest('td').parents('table:first').removeClass('orange').addClass('green');";				
		strVar += " var color_obj = jQuery(this).closest('table');";
		strVar += "color_obj = color_obj.removeClass('orange');";
		strVar += "color_obj = color_obj.removeClass('white');";
		strVar += "color_obj = color_obj.addClass('green');";
		strVar += "				}";
		strVar += "			}";
		strVar += "	if(a_partial_reconciled_arr_2!=null && a_partial_reconciled_arr_2!='' && a_partial_reconciled_arr_2!=undefined)";
		strVar += "	{";
		strVar += "	if(a_item_2_arr!=null && a_item_2_arr!='' && a_item_2_arr!=undefined)";
		strVar += "	{";
		strVar += " jQuery(this).closest('td').parents('table:first').removeClass('white').addClass('orange');";
		strVar += "	a_AP_Bill_1_arr.push(i_bill_2_G);";
		strVar += "	}";
		strVar += "	}";
		strVar += "	}";
		strVar += "	var i_cnt_A = 0 ;"
		strVar += "	var i_vnt_A = 0 ;"
		strVar += "	var a_fully_reconciled_arr_1 = new Array();";
		strVar += "	var a_partial_reconciled_arr_1 = new Array();";
		strVar += "	for(var q_x_2 = 0 ; q_x_2<i_lines_1_G ; q_x_2++){";
		strVar += " 	i_vnt_A = parseFloat(q_x_2)+parseFloat(1) ;"
		strVar += "		var item_id_1 = i_vnt_A+'_'+'apbillitem'+'_'+i_bill_1_G;";
		strVar += "		var quantity_id_1 = i_vnt_A+'_'+'apbillquantity'+'_'+i_bill_1_G;";
		strVar += "		var unreconciledquantity_id_1 = i_vnt_A+'_'+'apbillunreconciledquantity'+'_'+i_bill_1_G;";
		strVar += "		var i_quantity_1  = jQuery(table_1+' td.'+quantity_id_1).text();";
		strVar += "		var i_split_I_array = new Array(); ";
		strVar += "		var i_item_1_split  = jQuery(table_1+' td.'+item_id_1).text();";
		strVar += "		i_split_I_array = i_item_1_split.split('APLINE_');";
		strVar += "		var i_item_1 = i_split_I_array[0];";
		strVar += "		var i_div_1 = i_split_I_array[1];";
		strVar += "		var i_unreconcilled_qty_1  = jQuery(table_1+' td.'+unreconciledquantity_id_1).text();";
		strVar += "		if(i_unreconcilled_qty_1  == 0){";
		strVar += "			a_fully_reconciled_arr_1.push(i_unreconcilled_qty_1);";
		strVar += "		}";
		strVar += "	else";
		strVar += "	{";
		strVar += "	a_partial_reconciled_arr_1.push(i_unreconcilled_qty_2);";
		strVar += "	}";
		strVar += "}";
		strVar += "	if(a_fully_reconciled_arr_1!=null && a_fully_reconciled_arr_1!= '' && a_fully_reconciled_arr_1!=undefined){";
		strVar += "	if(a_fully_reconciled_arr_1.length == i_lines_1_G){";
		//strVar += "  jQuery(i_billTable).closest('td').parents('table:first').removeClass('orange').addClass('green');";
		strVar += " var color_obj = jQuery(i_billTable).closest('table');";
		strVar += "color_obj = color_obj.removeClass('orange');";
		strVar += "color_obj = color_obj.removeClass('white');";
		strVar += "color_obj = color_obj.addClass('green');";
		strVar += "	a_AP_Product_2_arr.push(i_bill_1_G);";
		strVar += "		  			}";
		strVar += "				}";
		strVar += "	if(a_partial_reconciled_arr_1!=null && a_partial_reconciled_arr_1!='' && a_partial_reconciled_arr_1!=undefined)";
		strVar += "	{";
		strVar += "	if(a_item_1_arr!=null && a_item_1_arr!='' && a_item_1_arr!=undefined)";
		strVar += "	{";
		strVar += "	a_AP_Product_2_arr.push(i_bill_1_G);";
		strVar += "      jQuery(i_billTable).closest('table').removeClass('white').addClass('orange');";
		strVar += "	}";
		strVar += "	}";
		strVar += " }";
		strVar += "a_AP_Bill_1_arr =remove_duplicates(a_AP_Bill_1_arr);";
		strVar += "a_AP_Product_2_arr = remove_duplicates(a_AP_Product_2_arr);";
		strVar += "var notmatched = 0;";

		strVar += "var block_rvn = 0;";
		strVar += "if(negative_not_allow == 'YES')";
		strVar += "{";
		strVar += "	alert('Items are not matched due to negative quantity on bill.');	";
		strVar += " notmatched = 1;";
		strVar += " block_rvn = 1;";
		strVar += "negative_not_allow = 'NO';";
		strVar += "};";



		strVar += "if(a_AP_Bill_1_arr == null || a_AP_Bill_1_arr =='' || a_AP_Bill_1_arr == undefined && a_AP_Product_2_arr == null || a_AP_Product_2_arr == '' || a_AP_Product_2_arr == undefined)";
		strVar += "{";
		strVar += "if(i_dropped == 'YES' && block_rvn != 1)";
		strVar += "{";
		strVar += "	alert('Items are not matched no similar items.');	";
		strVar += " notmatched = 1;";
		strVar += "}";
		strVar += "}";

		// CODE TO ADD VALUES IN ONORDERED LIST 
		strVar += " if(notmatched == 0)";
		strVar += "	{";
		strVar += "i_dropped = 'NO';";
		strVar += "var bill_ID_S = '.'+i_bill_1_G;";
		strVar += "var product_ID_S = '.'+i_bill_2_G;";
		strVar += "var id_1 = 'apbill'+i_bill_1_G+'_'+'approduct'+i_bill_2_G;";

		strVar += "var bill_customer_label = GetAp_Bill_Order_Final_Label(a_ap_order_customerData,i_bill_2_G,'aporder');";
		strVar += "var ap_order_customer_label = GetAp_Bill_Order_Final_Label(a_ap_bill_customerData,i_bill_1_G,'apbill');";

		strVar += " if(_logValidation(bill_customer_label) == false)"
		strVar += "{"
		strVar += "bill_customer_label = i_bill_2_G;"
		strVar += "}"
		strVar += " if(_logValidation(ap_order_customer_label) == false)"
		strVar += "{"
		strVar += "	ap_order_customer_label = i_bill_1_G;"
		strVar += "}"

		strVar += "if(a_AP_Bill_1_arr!=null && a_AP_Bill_1_arr!=''&&a_AP_Bill_1_arr!=undefined)";
		strVar += "{";
		strVar += "jQuery(bill_ID_S).append('<li id ='+id_1+'><a  class =jumper><font color=blue><u>'+bill_customer_label+'</u></font></a><mark class=mark id='+id_1+'>&nbsp;<img src=\"" + x_icon_image + "\" width= \"16px\" height =\"16px\"></mark></li>');";
		strVar += "}";
		strVar += "if(a_AP_Product_2_arr!=null && a_AP_Product_2_arr!=''&&a_AP_Product_2_arr!=undefined)";
		strVar += "{";
		strVar += " jQuery(product_ID_S).append('<li id ='+id_1+'><a  class=jumper_product><font color=blue><u>'+ap_order_customer_label+'</u></font></a><mark class=mark  id='+id_1+'>&nbsp;<img src=\"" + x_icon_image + "\" width= \"16px\" height =\"16px\"></mark></li>');";
		strVar += "}";
		strVar += "	};";
		strVar += "	};";
		strVar += " }catch(ex1){alert('Error in stop - '+ex1);}";
		strVar += "	}";
		strVar += "});";


		// DROPPABLE CODE START 
		//strVar += "    jQuery('.table1 p').droppable({";
		strVar += "    jQuery('.table1').droppable({";
		strVar += "activeClass: 'ui-state-hover',";
		strVar += " hoverClass: 'ui-state-active',";
		strVar += "tolerance: 'pointer',";
		strVar += "    drop: function (event, ui) {";
		strVar += "    jQuery(ui.draggable).draggable('enable');";
		strVar += "    var html_2 = jQuery(this).html(); ";
		strVar += "    var parTr = jQuery(this).closest('table');";


		strVar += "   var draddable_data =  jQuery(ui.draggable).text();";
		strVar += "   var draddable_data_split_1 = draddable_data.split(':');"
		strVar += "   var draddable_data_split_2 = draddable_data_split_1[1].split('O');"
		strVar += "	  var draddable_avoid = draddable_data_split_2[0];";
		strVar += "	  var Customer_ss = draddable_data_split_1[3];";
		strVar += "	  Customer_ss = Customer_ss.toString().slice(0,Customer_ss.length - 14);";

		strVar += "    var table_id_1= jQuery(parTr).attr('id');";

		strVar += "    i_billTable= jQuery(this);";

		strVar += "    var i_bill_no_split_1 = new Array();";
		strVar += " 	var i_bill_no_split_1_1 = new Array();";
		strVar += " 	var i_bill_no_split_1_1_1 = new Array();";
		strVar += "	 	i_bill_no_split_1 = table_id_1.split('apbill');";
		strVar += "	 	var i_bill_no_1 = i_bill_no_split_1[0];";

		strVar += "var allow_again = 0;";
		strVar += "var s_current_ID_1 = 'ul.'+i_bill_no_1+' '+' li';";
		strVar += "   jQuery('.'+i_bill_no_1+' li').each(function(i, li) {";
		strVar += "  	  var product = jQuery(li);  "
		strVar += "    var li_text = jQuery(product).text(); ";

		strVar += "		li_text_split = li_text.split('X');";
		//	strVar += "     alert('product: li_text_split-->'+li_text_split[0]+ 'draddable_avoid-->'+draddable_avoid.toString().trim());";
		strVar += "   if(li_text_split[0].toString().trim() == draddable_avoid.toString().trim())";
		strVar += "	{";
		strVar += " 	allow_again = 1 ;";
		strVar += "	};"
		strVar += "   });"
		strVar += "		var i_lines_1_split = i_bill_no_split_1[1];";
		//  strVar += "     alert('product: i_lines_1_split-->'+i_lines_1_split);";
		strVar += "		i_bill_no_split_1_1 = i_lines_1_split.split('index');";
		strVar += "		var i_lines_1 = i_bill_no_split_1_1[0];";
		strVar += "		var i_index_1_split = i_bill_no_split_1_1[1];";
		strVar += "		i_bill_no_split_1_1_1 = i_index_1_split.split('status');";
		strVar += "		var i_index_1 = i_bill_no_split_1_1_1[0];";
		strVar += "		var i_status_1 = i_bill_no_split_1_1_1[1];";
		strVar += "    	i_lines_1 = i_lines_1.replace(\/[^0-9\.]+\/g, \"\");";

		strVar += "   if(allow_again == 0)	";
		strVar += "	{";

		strVar += " 		i_bill_1_G = i_bill_no_1 ;";
		strVar += " 		i_lines_1_G = i_lines_1 ;";
		strVar += " 		i_index_1_G = i_index_1 ;";
		strVar += " 		i_status_1_G = i_status_1 ;";
		strVar += " 		Customer_displayed = Customer_ss ;";

		strVar += " 		allowdrag = 1 ;";
		strVar += "	};"
		strVar += "   if(allow_again == 1)	";
		strVar += "	{";
		strVar += " 		i_bill_1_G = '' ;";
		strVar += " 		i_lines_1_G = '' ;";
		strVar += " 		i_index_1_G = '' ;";
		strVar += " 		i_status_1_G = '' ;";
		strVar += " 		allowdrag = 0 ;";
		strVar += " 		Customer_displayed = '' ;";
		strVar += "	};"


		strVar += " i_dropped = 'YES';";
		//	strVar +="alert('Dropped...'+table_id_1);";

		strVar += "      ui.draggable.addClass('dropped');";
		//strVar +="    ui.draggable.removeClass('draggable');"
		//strVar +="   ui.helper.clone(true).addClass('draggable').draggable({helper: 'clone' });";
		strVar += "  jQuery(ui.helper).clone(true).removeClass('draggable');";
		//$("#drop").droppable(
		//		{
		//          drop: function(event, ui) 
		//         {
		//clone and remove positioning from the helper element
		//          var $newDiv = ui.helper.clone(false).
		//         removeClass('ui-draggable-dragging')
		//        .css({position: 'absolute'})
		//        .draggable({ ancel: false }).appendTo(this);
		//    }
		//  });


		strVar += "        }";
		strVar += "    });";
		strVar += " }";
		strVar += " catch(ex){";
		strVar += " 	alert('error - '+ex);";
		strVar += " }";
		strVar += "});";
		strVar += "<\/script>";
		strVar += "<body>";
		strVar += "<div style=\"background-color: #cfeefc !important;border: 1px solid #417ed9;padding: 10px 10px 10px 20px;width:100%\"><b><u>IMPORTANT Instructions:<\/u><\/b><br\/><ul><li>To Start, click <img src='" + drag_icon_image + "' width= \"10px\" height =\"22px\"><\/img> on an AP Product Order and <b>Drag-and-Drop<\/b> the AP Product Order <b>to<\/b> the matching <b>AP Bill<\/b> to do a match.<\/li><li>To unmatch, click the <img src=\"" + x_icon_image + "\" width= \"12px\" height =\"12px\"> icon<\/li><li>To Save, click <b style=\"color: blue\">RECONCILE<\/b> at the top or bottom of the page.<\/li><ul><li>Depending on the number of match-ups, on clicking <b style=\"color: blue\">RECONCILE<\/b>, the page may take between 5 seconds and 2 minute to reload<li>During the reconciliation process, a blank white screen will pop-up - please be patient and wait for the page to reload<\/li><li><b>DO NOT CLOSE ANY WINDOWS</b> whilst the system is reconciling<\/li><li>closing any windows or tabs may result in you needing to re-do your reconciliation.<\/li><\/ul><\/li><li>You may <b>ONLY<\/b> match up to <b style=\"color: red\">20 AP Product Orders<\/b> <u>per reconciliation session<\/u>. <ul><li>Matching <u>more than 20 Orders<\/u> will <b style=\"color: green\">AUTOMATICALLY<\/b> <b style=\"color: blue\">RECONCILE<\/b> your work and reload the page.<\/li><\/ul><\/ul><\/div><br\/><br\/>";

		// CODE TO DESIGN AP BILL AND AP PRODUCT ORDERS HEADERS  


		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td align=\"center\" width = 100%>";

		if (f_partner == true) {
			strVar += "Franchisee  :  <select disabled id = partner_apply class = partner_apply>";
		} else {
			strVar += "Franchisee  :  <select id = partner_apply class = partner_apply>";
		}
		strVar += ptrStr;
		strVar += "<\/select> ";
		strVar += "<\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";


		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td align=\"center\" width = 46%><h1><\/h1><\/td>";
		strVar += "<td width = 3%><\/td>";
		strVar += "<td align=\"center\" width = 46%><h1><\/h1><\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";


		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td align=\"center\" width = 46%><h1><\/h1><\/td>";
		strVar += "<td width = 3%><\/td>";
		strVar += "<td align=\"center\" width = 46%><h1><\/h1><\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";



		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td align=\"center\" width = 46%><h1>AP Bills <\/h1><\/td>";
		strVar += "<td width = 3%><\/td>";
		strVar += "<td align=\"center\" width = 46%><h1>AP Product Orders<\/h1><\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";


		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td align=\"center\" width = 46%><\/td>";
		strVar += "<td width = 3%><\/td>";
		strVar += "<td align=\"center\" width = 46%><\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";

		//align=\"center\"


		/*	
		strVar += "<table width = 100%>";
		strVar += "<tr>";	
		strVar += "<td  width = 46%>";
		strVar += "Partner  :  <select id = partner_bill class = partner_bill>";		
		strVar += ptrStr;		
		strVar += "<\/select> ";
		strVar += "<button onclick=\"apply_partner();\" class=\"apply_partner\"  >  Apply<\/button>";
		
		strVar +="<\/td>";
		strVar += "<td width = 3%><\/td>";
		strVar += "<td  width = 46%>" 
		strVar += "Partner  :  <select id = partner_product class = partner_product>";		
		strVar += ptrStr;		
		strVar += "<\/select> ";
		strVar += "<button onclick=\"apply_partner();\" class=\"apply_partner\"  >  Apply<\/button>";
					
		strVar += "<\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";	
  */


		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td align=\"center\" width = 46%><\/td>";
		strVar += "<td width = 3%><\/td>";
		strVar += "<td align=\"center\" width = 46%><\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";
		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td align=\"center\" width = 46%><\/td>";
		strVar += "<td width = 3%><\/td>";
		strVar += "<td align=\"center\" width = 46%><\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";
		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td align=\"center\" width = 46%><\/td>";
		strVar += "<td width = 3%><\/td>";
		strVar += "<td align=\"center\" width = 46%><\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";
		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td align=\"center\" width = 46%><\/td>";
		strVar += "<td width = 3%><\/td>";
		strVar += "<td align=\"center\" width = 46%><\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";



		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td width =  \"46%\"  align=\"center\">";


		//	d_ap_bill_from_date,d_ap_bill_to_date,d_ap_product_from_date,d_ap_product_to_date,


		if (d_ap_bill_from_date != '' && d_ap_bill_to_date != '') {
			strVar += "From Date : <input type='text' id='ap_bill_from_date' class = target value = " + d_ap_bill_from_date + ">";
			strVar += "          To Date : <input type='text' id='ap_bill_to_date' class = target value = " + d_ap_bill_to_date + ">";

		} else {
			strVar += "From Date : <input type='text' id='ap_bill_from_date' class = target value = ''>";
			strVar += "          To Date : <input type='text' id='ap_bill_to_date' class = target value = ''>";

		}
		strVar += " ";
		strVar += " ";

		//strVar += "<button onsubmit= \"apply(event);return false;\" class=\"apply\">  Apply<\/button>";
		strVar += "<button onclick=\"apply();\" class=\"apply\"  >  Apply<\/button>";

		strVar += "<\/td>";
		strVar += "<td width = 3%>";
		strVar += "<button onclick=\"createInput();\" class=\"reconcile\"  >Reconcile<\/button>";
		strVar += "<\/td>";
		strVar += "<td width = \"46%\"  align=\"center\">";

		//		d_ap_bill_from_date,d_ap_bill_to_date,d_ap_product_from_date,d_ap_product_to_date,


		if (d_ap_product_from_date != '' && d_ap_product_to_date != '') {
			strVar += "From Date : <input type='text' id='ap_product_from_date' class = target value = " + d_ap_product_from_date + ">";
			strVar += "          To Date : <input type='text' id='ap_product_to_date' class = target value = " + d_ap_product_to_date + ">";
		} else {
			strVar += "From Date : <input type='text' id='ap_product_from_date' class = target value = ''>";
			strVar += "          To Date : <input type='text' id='ap_product_to_date' class = target value = ''>";
		}
		strVar += " ";
		strVar += " ";

		strVar += "<button onclick=\"apply();\" class=\"apply\"  >  Apply<\/button>";

		strVar += "<\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";


		//  cellspacing=\"10\"

		strVar += "<table   width = 100%>";
		strVar += "<tr>";

		strVar += "<td class = apbilltable height = 70% width=\"46%\" align=\"center\">"
		strVar += "<div style=\"border:1px solid black;width:100%;height:700px;overflow:auto\">";
		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td width = 2%>";
		strVar += "<\/td>";
		strVar += "<td width = 96%>";
		var a_QMA_array_values = new Array();


		if (!_logValidation(a_bill_array_1)) {
			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";

			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";

			/*
			
			strVar += "<table width = 100%>";
			strVar += "<tr>";	
			strVar += "<td>";
			
			
		//	d_ap_bill_from_date,d_ap_bill_to_date,d_ap_product_from_date,d_ap_product_to_date,
			
						
			if(d_ap_bill_from_date!='' && d_ap_bill_to_date!='')
			{
				strVar += "From Date : <input type='text' id='ap_bill_from_date' class = target value = "+d_ap_bill_from_date+">";
				strVar += "  To Date : <input type='text' id='ap_bill_to_date' class = target value = "+d_ap_bill_to_date+">";
			}
			else
			{
				strVar += "From Date : <input type='text' id='ap_bill_from_date' class = target value = ''>";
				strVar += "  To Date : <input type='text' id='ap_bill_to_date' class = target value = ''>";
			}
			strVar += " ";
			strVar += " ";
			
			strVar += "<button onsubmit= \"apply(event);return false;\" class=\"apply\">  Apply<\/button>";
			
			
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";
			
			*/
			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";


			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";
		}

		if (_logValidation(a_bill_array_1)) {
			var i_counter_bill_1 = 0;

			//  if(a_bill_array_1.length>30)
			//   {
			//	  i_counter_bill_1 = 30;
			//   }//end of if
			//    else
			{
				i_counter_bill_1 = a_bill_array_1.length;
			} //end of else

			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";

			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";

			/*
				strVar += "<table width = 100%>";
				strVar += "<tr>";	
				strVar += "<td>";
				
			//	d_ap_bill_from_date,d_ap_bill_to_date,d_ap_product_from_date,d_ap_product_to_date,
				
				
				if(d_ap_bill_from_date!='' && d_ap_bill_to_date!='')
				{
					strVar += "From Date : <input type='text' id='ap_bill_from_date' class = target value = "+d_ap_bill_from_date+">";
					strVar += "  To Date : <input type='text' id='ap_bill_to_date' class = target value = "+d_ap_bill_to_date+">";
				}
				else
				{
					strVar += "From Date : <input type='text' id='ap_bill_from_date' class = target value = ''>";
					strVar += "  To Date : <input type='text' id='ap_bill_to_date' class = target value = ''>";
				}
				strVar += " ";
				strVar += " ";
				
				strVar += "<button onclick=\"apply();\" class=\"apply\"  >  Apply<\/button>";
				
				strVar += "<\/td>";
				strVar += "<\/tr>";
				strVar += "<\/table>";
				*/
			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";


			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";


			var a_split_arr_1 = new Array();

			for (var b_1 = 0; b_1 < i_counter_bill_1; b_1++) {
				var i_cnt = 0;
				var i_unauthorized_item_CHK = "";
				var i_no_of_days_VAR = 0;
				var i_bill_amount = 0;
				var flag_C_1 = 0;

				var i_bill_no = a_bill_no_display_array_1[a_bill_array_1[b_1]].bill_no;
				var i_assignment_no = a_bill_no_display_array_1[a_bill_array_1[b_1]].assignment_no;
				var i_corporate_po = a_bill_no_display_array_1[a_bill_array_1[b_1]].corporate_po;
				var d_date = a_bill_no_display_array_1[a_bill_array_1[b_1]].date;
				var i_status = a_bill_no_display_array_1[a_bill_array_1[b_1]].status;
				var i_status_text = a_bill_no_display_array_1[a_bill_array_1[b_1]].statustext;
				var a_product_array_mappings = a_bill_no_display_array_1[a_bill_array_1[b_1]].productarray;
				i_bill_amount = a_bill_no_display_array_1[a_bill_array_1[b_1]].bill_amount;

				if (!_logValidation(i_bill_amount)) {
					i_bill_amount = 0;
				} else {
					i_bill_amount = parseFloat(i_bill_amount).toFixed(1);
				}

				var s_AP_Bill_no = 'AP&nbsp;Bill&nbsp;No&nbsp;:&nbsp;' + i_bill_no;
				var i_no_of_items = findOccurrences(a_bill_occurences_1, i_bill_no);
				var id_1 = i_bill_no + 'apbill' + 'no_of_items' + i_no_of_items + 'index' + b_1 + 'status' + i_status;
				var f_is_green = a_green_array_1.indexOf(a_bill_array_1[b_1]);
				var f_is_orange = a_orange_array_1.indexOf(a_bill_array_1[b_1]);
				var f_is_white = a_white_array_1.indexOf(a_bill_array_1[b_1]);
				var class_main = 'table1';

				// 	if(a_green_array_1.length == ) 
				if (f_is_green > -1 && f_is_orange == -1) {
					strVar += "<table data-name=" + i_bill_no + " width = 100% id=" + id_1 + "  bgcolor=\"lightgreen\" class = " + class_main + ">";
				}
				if (f_is_orange > -1 || (f_is_white > -1 && (f_is_green > -1 || f_is_orange > -1))) {
					strVar += "<table data-name=" + i_bill_no + " width = 100% id=" + id_1 + " bgcolor=\"orange\" class = " + class_main + ">";
				}
				if ((f_is_green == -1) && (f_is_orange == -1)) {
					strVar += "<table data-name=" + i_bill_no + "  width = 100% id=" + id_1 + " class = " + class_main + ">";
				}

				if (!_logValidation(i_assignment_no)) {
					//i_assignment_no = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"
				}

				//	var space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

				var space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

				if (!_logValidation(i_assignment_no)) {
					i_assignment_no = space;
				}
				//	var space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

				/////  style=\"color:pink\"

				var s_bgcolor = "bgcolor = \"#ffffcc\"";


				i_bill_amount = parseFloat(i_bill_amount).toFixed(2);

				strVar += "<tr><td width=\"45%\" id = " + id_1 + ">";

				strVar += "<table width=\"100%\">";
				strVar += "<tr><td class = headers align=\"left\" width=\"50%\">Bill Date :<b>" + d_date + "<\/b><\/td><td align=\"right\" class = totalamount width=\"50%\">$ " + i_bill_amount + "<\/td><\/tr>";
				strVar += "<tr><td class = headers align=\"left\" width=\"50%\"><b>" + i_corporate_po + "<\/b><\/td><td width=\"50%\"><\/td><\/tr>";
				strVar += "<tr><td align=\"left\" width=\"50%\">Assignment #:<b>" + i_assignment_no + "<\/b><\/td><td width=\"50%\"><\/td><\/tr>";
				strVar += "<tr><td align=\"left\" width=\"50%\">" + s_AP_Bill_no + "<\/td><td width=\"50%\"><\/td><\/tr>";
				strVar += "<\/table>";

				strVar += "<\/td><\/tr>";


				/*
	            	 
	            	
	                    strVar += "<tr><td id = "+id_1+">";
	                    strVar += "<div id = "+id_1+"><p>";            	
	                    strVar += s_AP_Bill_no+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>Bill&nbsp;Date&nbsp;:&nbsp;"+d_date+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Corporate&nbsp;PO&nbsp;:&nbsp;"+i_corporate_po;             	
	                    strVar += "<\/b><br>Assignment&nbsp;#&nbsp;:&nbsp;"+i_assignment_no+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Status&nbsp;:&nbsp;"+i_status_text;
	                    strVar += "<\/p><\/div>";
	                    strVar += "<\/td><\/tr>";
	        		
	            */
				//     strVar += "<tr><td width=\"45%\" align=\"right\"><button onclick=\"dispute("+a_bill_array_1+");dispute_2("+a_bill_array_1+");\" class=\"dispute\">Dispute<\/button><\/td><\/tr>";
				/*
	                	strVar += "<tr><td  align=\"right\" colspan = \"2\">";
	                	strVar += "<button onclick=\"dispute("+a_bill_array_1+");dispute_2("+a_bill_array_1+");\" class=\"dispute\">Dispute<\/button>";
	            	   	strVar += "<\/td><\/tr>";
	            */
				var class_v = 'prodtd' + i_bill_no;

				// CODE TO CREATE UN ORDER LIST IN AP BILL TABLE 
				strVar += "<tr><td align=\"left\" colspan = \"2\">";
				strVar += "<table class = prod>";
				strVar += "<ul class =" + i_bill_no + ">";

				if (_logValidation(a_product_array_mappings)) {
					for (var p_1 = 0; p_1 < a_product_array_mappings.length; p_1++) {
						var id_1 = 'apbill' + i_bill_no + '_' + 'approduct' + a_product_array_mappings[p_1];
						var bill_customer_label = GetAp_Bill_Order_Final_Label(a_AP_Order_Array_scroll, a_product_array_mappings[p_1], 'aporder');
						strVar += "<li><a  class =jumper><font color=blue><u>" + bill_customer_label + "</u></font></a><mark class=mark id=" + id_1 + ">&nbsp;<img src=\"" + x_icon_image + "\" width= \"16px\" height =\"16px\"></mark><\/li>";

					}
				}

				//	var unmatched_string ='['+i_bill_no+'|'+''+'|'+i_unreconcilled_qty_1 +'|'+i_unreconcilled_original_qty_1 +'|'+i_table_1 +'|'+i_unreconciled_qty_id_1+'|'+i_bill_2_G+'|'+ i_AP_Line_ID_2+'|'+i_unreconcilled_qty_2 +'|'+i_unreconcilled_original_qty_2 +'|'+i_table_2  +'|'+i_unreconciled_qty_id_2+']';

				strVar += "<\/ul>";
				strVar += "<\/table>";
				strVar += "<\/td><\/tr>";

				/*
	            	    strVar += "var bill_ID_S = '.'+i_bill_1_G;";
						strVar += "var product_ID_S = '.'+i_bill_2_G;";					
						strVar += "var id_1 = 'apbill'+i_bill_1_G+'_'+'approduct'+i_bill_2_G;";					
						strVar += "if(a_AP_Bill_1_arr!=null && a_AP_Bill_1_arr!=''&&a_AP_Bill_1_arr!=undefined)";
						strVar += "{";
				        strVar += " jQuery(bill_ID_S).append('<li id ='+id_1+'>'+a_AP_Bill_1_arr+'</li>');";		
						strVar += "}";					
						strVar += "if(a_AP_Product_2_arr!=null && a_AP_Product_2_arr!=''&&a_AP_Product_2_arr!=undefined)";
						strVar += "{";
				        strVar += " jQuery(product_ID_S).append('<li id ='+id_1+'>'+a_AP_Product_2_arr+'</li>');";		
						strVar += "}";            	  
	            	    */

				strVar += "<tr><td colspan = \"2\">";
				var class_b = 'apbillitemtable_' + b_1;
				strVar += "<table width=\"100%\" id = " + class_b + " class = " + class_b + ">";

				strVar += "<tr class = trstyle1><td align=\"center\" width=\"15%\"><b>Item<\/b><\/td><td align=\"center\" width=\"10%\"><b>Description<\/b><\/td><td align=\"center\" width=\"10%\"><b>Qty<\/b><\/td><td align=\"center\" width=\"10%\"><b>Unreconciled Qty<\/b><\/td><\/tr>";

				for (var d_1 = 0; d_1 < a_data_array_1.length; d_1++) {
					a_split_arr_1 = a_data_array_1[d_1].split('@@&!!&@@');

					var i_bill_no_1 = a_split_arr_1[0];
					var s_compare_str_1 = a_split_arr_1[1];
					var s_item_txt_1 = a_split_arr_1[2];
					var i_quantity_1 = a_split_arr_1[3];
					if (_logValidation(i_quantity_1)) {
						i_quantity_1 = parseFloat(i_quantity_1).toFixed(1);
					}
					var i_AP_line_item_ID_1 = a_split_arr_1[4];
					var s_corporate_po_1 = a_split_arr_1[5];
					var d_date_1 = a_split_arr_1[6];
					var i_assignment_no_1 = a_split_arr_1[7];
					var s_status_1 = a_split_arr_1[8];
					var i_description_1 = a_split_arr_1[9];
					var i_item_1 = a_split_arr_1[10];
					var i_no_of_days = a_split_arr_1[11];
					var i_unreconcilled_qty = a_split_arr_1[12];
					if (_logValidation(i_unreconcilled_qty)) {
						i_unreconcilled_qty = parseFloat(i_unreconcilled_qty).toFixed(1);
					}
					var i_matching_done_1 = a_split_arr_1[13];
					var i_reconciliation_status_1 = a_split_arr_1[14];
					var i_offsetting_AP_Bill_ID_1 = a_split_arr_1[15];
					var i_offsetting_product_order_ID_1 = a_split_arr_1[16];
					//var a_product_array_mappings = a_split_arr_1[17];
					var a_quantity_wise_mappings = a_split_arr_1[18];

					//var a_QMA_array_values = new Array();	
					var i_data_TT = new Array();
					i_data_TT = a_quantity_wise_mappings;

					if (_logValidation(i_data_TT)) {
						for (var dt = 0; dt < i_data_TT.length; dt++) {
							a_QMA_array_values = i_data_TT.split(',');
							break;
						}
					} //Data TT	

					if (i_bill_no_1 == a_bill_array_1[b_1]) {
						i_cnt++;
						i_no_of_days_VAR = i_no_of_days;

						if ((i_item_1 == i_unauthorized_item) && (i_reconciliation_status_1 != 6)) {
							var s_class_name = 'trstyle_un'
							i_unauthorized_item_CHK = i_item_1;
						} else {
							var s_class_name = 'trstyle2';
						}
						var item_id_1 = i_cnt + '_' + 'apbillitem' + '_' + i_bill_no;
						var quantity_id_1 = i_cnt + '_' + 'apbillquantity' + '_' + i_bill_no;
						var unreconciledquantity_id_1 = i_cnt + '_' + 'apbillunreconciledquantity' + '_' + i_bill_no;
						var i_ap_line_id = 'APLINE_' + i_AP_line_item_ID_1;

						if ((i_unreconcilled_qty == i_quantity_1) && (i_unreconcilled_qty != 0)) {
							strVar += "<tr  style=\"color:black\"  class = " + s_class_name + ">";
						}
						if ((i_unreconcilled_qty == 0)) {
							strVar += "<tr  style=\"color:green\"  class = " + s_class_name + ">";
						}
						if ((i_unreconcilled_qty < i_quantity_1) && (i_unreconcilled_qty != 0)) {
							strVar += "<tr  style=\"color:red\"  class = " + s_class_name + ">";
						}
						///////6 Jan 2016


						if ((i_unreconcilled_qty > i_quantity_1) && (i_unreconcilled_qty != 0)) {
							strVar += "<tr  style=\"color:red\"  class = " + s_class_name + ">";
						}


						///////// 6 Jan 2016

						strVar += "<td align=\"center\" width=\"15%\" id = " + item_id_1 + " class = " + item_id_1 + ">" + s_item_txt_1 + "<div style=\"display:none\">" + i_ap_line_id + "</div><\/td>";
						strVar += "<td align=\"center\" width=\"10%\">" + i_description_1 + "<\/td>"
						strVar += "<td align=\"center\" width=\"10%\" id = " + quantity_id_1 + " class = " + quantity_id_1 + " >" + i_quantity_1 + "<\/td>";
						strVar += "<td align=\"center\" width=\"10%\" id = " + unreconciledquantity_id_1 + " class = " + unreconciledquantity_id_1 + " >" + i_unreconcilled_qty + "<\/td>";
						strVar += "<\/tr>";
						/*
						strVar +=	"if(i_unreconcilled_qty == 0)";
						strVar +=	"{";
						strVar += "	jQuery('.table1 td.'+i_unreconciled_qty_id_1.toString()).closest('tr').css('color', 'blue');";
						strVar +=	"}";
						*/


					}
				} //Data Array Loop			      	
				strVar += "<\/table>";
				strVar += "<\/td><\/tr>";


				strVar += "<tr><td class = outstanding width = \"45%\">";
				strVar += "<table width = 100%>";
				strVar += "<tr><td align=\"left\" width = 30%><button onclick=\"dispute_2(" + a_bill_array_1[b_1] + ");\" class=\"dispute\">Dispute<\/button><\/td>";

				if (i_unauthorized_item_CHK == i_unauthorized_item) {
					// strVar += "<td align=\"center\" width = 40%><button onclick=\"confirm("+a_bill_array_1[b_1]+");\" class=\"confirm\" >Confirm Unauthorised Product(s)<\/button><\/td>";
				} else {
					strVar += "<td align=\"center\" width = 40%><\/td>";
				}

				if (i_no_of_days_VAR >= 5) {
					strVar += "<td align=\"right\" class = outstanding width = 30%>OUTSTANDING<\/td><\/tr>";
				} else {
					strVar += "<td align=\"right\" width = 30%><\/td><\/tr>";
				}

				strVar += "<\/table>";
				strVar += "<\/td>";
				strVar += "<\/tr>";

				/*
			      	
			      	if(i_unauthorized_item_CHK == i_unauthorized_item)
		      		{
			      		if(i_no_of_days_VAR>=5)   
		      			{
			      			strVar += "<tr><td class = outstanding width = \"20%\" align=\"left\">OUTSTANDING<\/td>";	  
			      			strVar += "<td width = \"25%\" align=\"right\"><button onclick=\"confirm("+a_bill_array_1[b_1]+");\" class=\"confirm\" >Confirm Unauthorised Product(s)<\/button><\/td><\/tr>";	      			
		      			}
			      		else
		      			{
			      			strVar += "<tr><td width = \"20%\" align=\"left\"><\/td><td  width = \"25%\" align=\"right\"><button onclick=\"confirm("+a_bill_array_1[b_1]+");\" class=\"confirm\">Confirm Unauthorised Product(s)<\/button><\/td><\/tr>";	      			
		      			}		      					         		
		      		}
			      	else
			      	{
			      		if(i_no_of_days_VAR>=5)
		      			{
			      			strVar += "<tr><td class = outstanding width = \"20%\" align=\"left\">OUTSTANDING<\/td><\/tr>";	      				      		
		      			}		      			
			      	}
			      	
			      	*/

				strVar += "<\/table>";
				strVar += "<table>";
				strVar += "<tr><td width=\"25%\" align=\"left\"><\/td><td width=\"20%\" align=\"right\"><\/td><\/tr>";
				strVar += "<tr><td width=\"25%\" align=\"left\"><\/td><td width=\"25%\" align=\"right\"><\/td><\/tr>";
				strVar += "<tr><td width=\"25%\" align=\"left\"><\/td><td width=\"20%\" align=\"right\"><\/td><\/tr>";
				strVar += "<tr><td width=\"25%\" align=\"left\"><\/td><td width=\"20%\" align=\"right\"><\/td><\/tr>";
				strVar += "<\/table>";

			} //Loop Bill Array 1	
		} //Bill Array 1

		strVar += "<\/td>";
		strVar += "<td width = 2%>";
		strVar += "<\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";
		strVar += "<\/td>";
		strVar += "<\/div>";
		strVar += "<\/td>";
		strVar += "<td width = 3%><\/td>";
		strVar += "<td  class = approducttable height =70%  width = 46% align=\"center\">"
		strVar += "<div style=\"border:1px solid black;width:100%;height:700px;overflow:auto\">";
		strVar += "<table width = 100%>";
		strVar += "<tr>";
		strVar += "<td width = 2%><\/td>";
		strVar += "<td width = 96%>";
		//  CODE TO START PUT DATA IN AP ORDER TABLE

		if (!_logValidation(a_bill_array_2)) {

			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";

			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";

			/*
			strVar += "<table width = 100%>";
			strVar += "<tr>";	
			strVar += "<td>";
				
//			d_ap_bill_from_date,d_ap_bill_to_date,d_ap_product_from_date,d_ap_product_to_date,
			
			
		if(d_ap_product_from_date!='' && d_ap_product_to_date!='')
		{
			strVar += "From Date : <input type='text' id='ap_product_from_date' class = target value = "+d_ap_product_from_date+">";
			strVar += "  To Date : <input type='text' id='ap_product_to_date' class = target value = "+d_ap_product_to_date+">";
		}
		else
		{
			strVar += "From Date : <input type='text' id='ap_product_from_date' class = target value = ''>";
			strVar += "  To Date : <input type='text' id='ap_product_to_date' class = target value = ''>";
		}
		strVar += " ";
		strVar += " ";
		
		strVar += "<button onclick=\"apply();\" class=\"apply\"  >  Apply<\/button>";
		
			
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";
			
		*/
			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";


			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";

		}

		if (_logValidation(a_bill_array_2)) {
			var i_counter_bill_2 = 0;

			////	if(a_bill_array_2.length>30)
			//    {
			//		  i_counter_bill_2 = 30;
			//      }//end of if
			//     else
			{
				i_counter_bill_2 = a_bill_array_2.length;
			} //end of else

			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";

			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";

			/*
			
			
			strVar += "<table width = 100%>";
			strVar += "<tr>";	
			strVar += "<td>";
			
//			d_ap_bill_from_date,d_ap_bill_to_date,d_ap_product_from_date,d_ap_product_to_date,
			
			
			if(d_ap_product_from_date!='' && d_ap_product_to_date!='')
			{
				strVar += "From Date : <input type='text' id='ap_product_from_date' class = target value = "+d_ap_product_from_date+">";
				strVar += "  To Date : <input type='text' id='ap_product_to_date' class = target value = "+d_ap_product_to_date+">";
			}
			else
			{
				strVar += "From Date : <input type='text' id='ap_product_from_date' class = target value = ''>";
				strVar += "  To Date : <input type='text' id='ap_product_to_date' class = target value = ''>";
			}
			strVar += " ";
			strVar += " ";
			
			strVar += "<button onclick=\"apply();\" class=\"apply\"  >  Apply<\/button>";
			
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";
			
			*/
			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";


			strVar += "<table width = 100%>";
			strVar += "<tr>";
			strVar += "<td >";
			strVar += "<\/td>";
			strVar += "<\/tr>";
			strVar += "<\/table>";
			var a_split_arr_2 = new Array();

			for (var b_2 = 0; b_2 < i_counter_bill_2; b_2++) {
				var i_cnt = 0;
				var a_cancel_array = new Array();
				var a_product_cancel_array = new Array();
				var a_lines_array = '';
				var i_no_of_days_VAR = 0;

				var i_order_amount = 0.00;
				var i_commission = 0.00;


				var i_bill_no = a_bill_no_display_array_2[a_bill_array_2[b_2]].bill_no
				var s_customer = a_bill_no_display_array_2[a_bill_array_2[b_2]].customer
				var d_order_date = a_bill_no_display_array_2[a_bill_array_2[b_2]].order_date;
				var i_status = a_bill_no_display_array_2[a_bill_array_2[b_2]].status;
				var i_status_text = a_bill_no_display_array_2[a_bill_array_2[b_2]].statustext;
				var a_bill_array = a_bill_no_display_array_2[a_bill_array_2[b_2]].billarray;
				i_order_amount = a_bill_no_display_array_2[a_bill_array_2[b_2]].product_order_amount;
				var i_customer_ID = a_bill_no_display_array_2[a_bill_array_2[b_2]].customer_id;
				var i_commission = a_bill_no_display_array_2[a_bill_array_2[b_2]].franch_commi;

				if (!_logValidation(i_order_amount)) {
					i_order_amount = 0.00;
				} else {
					i_order_amount = parseFloat(i_order_amount).toFixed(1);
				}
				if (!_logValidation(i_commission)) {
					i_commission = 0.00;
				} else {
					i_commission = parseFloat(i_commission).toFixed(1);
				}

				var s_AP_Product_no = 'AP Product No :' + i_bill_no;

				var i_no_of_items = findOccurrences(a_bill_occurences_2, i_bill_no);

				var i_id_2 = i_bill_no + 'approductno' + 'no_of_items' + i_no_of_items + 'index' + b_2 + 'status' + i_status;

				var f_is_green = a_green_array_2.indexOf(a_bill_array_2[b_2]);
				var f_is_orange = a_orange_array_2.indexOf(a_bill_array_2[b_2]);

				var class_main = 'aptable1';

				if ((f_is_green > -1) && (f_is_orange == -1)) {
					strVar += "<table  id=" + i_bill_no + "  width=\"100%\"  bgcolor=\"lightgreen\" class = " + class_main + ">";
				}
				if (f_is_orange > -1) {
					strVar += "<table  id=" + i_bill_no + " width=\"100%\"  bgcolor=\"orange\" class = " + class_main + ">";
				}
				if ((f_is_green == -1) && (f_is_orange == -1) && i_status != 1) {
					strVar += "<table id=" + i_bill_no + " width=\"100%\"  class = " + class_main + ">";
				}
				if (i_status == 1) {
					strVar += "<table  id=" + i_bill_no + " width=\"100%\"  bgcolor=\"#bfbfbf\" class = " + class_main + ">";
				}

				var space = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

				if (i_status_text == 'New') {
					strVar += "<tr><td id = " + i_id_2 + "  width=\"45%\">";
					strVar += "<table width=\"100%\">";
					strVar += "<tr>";
					strVar += "<td align=\"left\" width=\"5%\"><img src='" + drag_icon_image + "' width= \"17px\" height =\"37px\"><\/img><\/td>";
					strVar += "<td width=\"60%\">";
					strVar += "<table width=\"100%\">";
					strVar += "<tr>";
					strVar += "<td class = headers align=\"left\" width=\"100%\">Order Date : <b>" + d_order_date + "<\/b><\/td>";
					strVar += "<\/tr>";
					strVar += "<tr>";
					strVar += "<td class = headers align=\"left\" width=\"100%\"><b>" + s_customer + "<\/b><\/td>";
					strVar += "<\/tr>";
					strVar += "<tr>";
					strVar += "<td align=\"left\" width=\"100%\">Status :<b>" + i_status_text + "<\/b><\/td>";
					strVar += "<\/tr>";
					strVar += "<tr>";
					strVar += "<td align=\"left\" width=\"100%\">" + s_AP_Product_no + "<\/td>";
					strVar += "<\/tr>";
					strVar += "<\/table>";
					strVar += "<\/td>";
					strVar += "<td align=\"right\" width=\"35%\">";
					strVar += "<table width=\"100%\">";
					strVar += "<tr>";

					i_order_amount = parseFloat(i_order_amount).toFixed(2);
					i_commission = parseFloat(i_commission).toFixed(2);

					strVar += "<td class = totalamount align=\"right\" width=\"100%\"> $ " + i_order_amount + "<\/td>";
					strVar += "<\/tr>";
					strVar += "<tr>";
					strVar += "<td align=\"right\" width=\"100%\"><b>Commission : $" + i_commission + "<\/b><\/td>";
					strVar += "<\/tr>";
					strVar += "<\/table>";
					strVar += "<\/td>";
					strVar += "<\/tr>";
					strVar += "<\/table>";
					strVar += "<\/td><\/tr>";
				} else {
					strVar += "<tr><td id = " + i_id_2 + " class = drag_td width=\"45%\">";
					strVar += "<table width=\"100%\">";
					strVar += "<tr>";
					strVar += "<td align=\"left\" width=\"5%\"><img src='" + drag_icon_image + "' width= \"17px\" height =\"37px\"><\/img><\/td>";
					strVar += "<td width=\"60%\">";
					strVar += "<table width=\"100%\">";
					strVar += "<tr>";
					strVar += "<td class = headers align=\"left\" width=\"100%\">Order Date : <b>" + d_order_date + "<\/b><\/td>";
					strVar += "<\/tr>";
					strVar += "<tr>";
					strVar += "<td class = headers align=\"left\" width=\"100%\"><b>" + s_customer + "<\/b><\/td>";
					strVar += "<\/tr>";
					strVar += "<tr>";
					strVar += "<td align=\"left\" width=\"100%\">Status :<b>" + i_status_text + "<\/b><\/td>";
					strVar += "<\/tr>";
					strVar += "<tr>";
					strVar += "<td align=\"left\" width=\"100%\">" + s_AP_Product_no + "<\/td>";
					strVar += "<\/tr>";
					strVar += "<\/table>";
					strVar += "<\/td>";
					strVar += "<td align=\"right\" width=\"35%\">";
					strVar += "<table width=\"100%\">";
					strVar += "<tr>";

					i_order_amount = parseFloat(i_order_amount).toFixed(2);
					i_commission = parseFloat(i_commission).toFixed(2);

					strVar += "<td class = totalamount align=\"right\" width=\"100%\"> $ " + i_order_amount + "<\/td>";
					strVar += "<\/tr>";
					strVar += "<tr>";
					strVar += "<td align=\"right\" width=\"100%\"><b>Commission :$" + i_commission + "<\/b><\/td>";
					strVar += "<\/tr>";
					strVar += "<\/table>";
					strVar += "<\/td>";
					strVar += "<\/tr>";
					strVar += "<\/table>";
					strVar += "<\/td><\/tr>";
				}
				/****
				* 	strVar += "<table width=\"100%\">"; 		
				strVar += "<tr><td width=\"50%\">Order Date : <b>"+d_order_date+"<\/b><\/td><td width=\"50%\"><\/td><\/tr>";
				strVar += "<tr><td width=\"50%\">"+s_customer+"<\/td><td width=\"50%\"><\/td><\/tr>";
				strVar += "<tr><td width=\"50%\">"+s_AP_Product_no+"<\/td><td width=\"50%\"><\/td><\/tr>";
				strVar += "<tr><td width=\"50%\">Status :<b>"+i_status_text+"<\/b><\/td><td width=\"50%\"><\/td><\/tr>";
				strVar += "<\/table>"; 
				*/
				/*			
				if(i_status_text == 'New')
				{
					strVar += "<tr><td   id = "+i_id_2+" width=\"45%\">";
		        	//strVar += "<div id = "+i_id_2+">";            	
		        	strVar += s_AP_Product_no+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Order&nbsp;Date&nbsp;:&nbsp;"+d_order_date;
		        	strVar += "<br>Customer&nbsp;:&nbsp;"+s_customer+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Status&nbsp;:&nbsp;"+i_status_text;        	
		        	//strVar += "<\/div>";
		        	strVar += "<\/td><\/tr>";
				}
				else
				{
					strVar += "<tr><td   id = "+i_id_2+" width=\"45%\">";
		        	strVar += "<div id = "+i_id_2+"><p>";            	
		        	strVar += s_AP_Product_no+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Order&nbsp;Date&nbsp;:&nbsp;"+d_order_date;
		        	strVar += "<br>Customer&nbsp;:&nbsp;"+s_customer+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Status&nbsp;:&nbsp;"+i_status_text;        	
		        	strVar += "<\/p><\/div>";
		        	strVar += "<\/td><\/tr>";
				}			
				*/

				var class_v = 'billtd' + i_bill_no;
				strVar += "<tr><td align=\"left\" colspan = \"2\">";
				strVar += "<table class = bill>";
				//	strVar += "<table class = bill>";

				// CODE TO CREATE UN ORDER LIST IN AP ORDER  TABLE 
				strVar += "<ul class =" + i_bill_no + ">";
				//  strVar += "  <li id = 1>List item 1<\/li>";    

				if (_logValidation(a_bill_array)) {
					for (var p_1 = 0; p_1 < a_bill_array.length; p_1++) {
						var i_id_2 = 'apbill' + a_bill_array[p_1] + '_' + 'approduct' + i_bill_no;
						var ap_order_customer_label = GetAp_Bill_Order_Final_Label(a_Bill_Array_scroll, a_bill_array[p_1], 'apbill');
						strVar += "<li><a  class =jumper_product><font color=blue><u>" + ap_order_customer_label + "</u></font></a><mark class=mark id=" + i_id_2 + ">&nbsp;<img src=\"" + x_icon_image + "\" width= \"16px\" height =\"16px\"></mark><\/li>";
						//strVar += "<li><a  class =jumper>"+a_product_array_mappings[p_1]+"</a><mark class=mark id="+id_1+">&nbsp;X</mark><\/li>"; 
					}
				}

				strVar += "<\/ul>";
				//	strVar += "<\/table>";     		
				//	strVar += "  <tr><td class ="+class_v+"><p><\/p></td></tr>";            		
				strVar += "<\/table>";
				strVar += "<\/td><\/tr>";
				/*		
				if(i_status == 1)
	       		{
	           		strVar += "<tr><td width=\"25%\" align=\"left\" class = ap1 id = "+i_id_2+">"+s_AP_Product_no+"<\/td>"
	       		}
	           	else
	       		{
	           		strVar += "<tr><td width=\"25%\" align=\"left\" class = ap1 id = "+i_id_2+"><p>"+s_AP_Product_no+"<\/p><\/td>"
	       		} 		
				strVar += "<tr><td width=\"25%\" align=\"left\">Order Date : "+d_order_date+"<\/td>"
				strVar += "<td width=\"20%\" align=\"right\"><\/td><\/tr>";
				strVar += "<tr><td width=\"25%\" align=\"left\">Customer : "+s_customer+"<\/td>"
				strVar += "<td width=\"20%\" align=\"right\"> <\/td><\/tr>";
				strVar += "<tr><td width=\"25%\" align=\"left\">Status:"+i_status_text+"  <\/td>"
				strVar += "<td width=\"20%\" align=\"right\"><\/td><\/tr>";
				*/

				strVar += "<tr><td colspan = \"2\">";

				var class_a = 'apitemtable_' + b_2;
				strVar += "<table width=\"100%\" class = " + class_a + "  id = " + class_a + ">";
				strVar += "<tr class = aptrstyle1 ><td width=\"25%\"  align=\"center\"><b>Item<\/b><\/td><td width=\"10%\"  align=\"center\"><b>Qty<\/b><\/td><td  align=\"center\" width=\"10%\"><b>Unreconciled Qty<\/b><\/td><\/tr>";

				for (var d_2 = 0; d_2 < a_data_array_2.length; d_2++) {
					a_split_arr_2 = a_data_array_2[d_2].split('@@&!!&@@');

					var i_bill_no_2 = a_split_arr_2[0];
					var s_compare_str_2 = a_split_arr_2[1];
					var s_item_txt_2 = a_split_arr_2[2];
					var i_quantity_2 = a_split_arr_2[3];
					if (_logValidation(i_quantity_2)) {
						i_quantity_2 = parseFloat(i_quantity_2).toFixed(1);
					}
					var i_AP_line_item_ID_2 = a_split_arr_2[4];
					var i_item_ID_2 = a_split_arr_2[5];
					var i_unreconcilled_qty_2 = a_split_arr_2[6];
					if (_logValidation(i_unreconcilled_qty_2)) {
						i_unreconcilled_qty_2 = parseFloat(i_unreconcilled_qty_2).toFixed(1);
					}
					var i_matching_done_2 = a_split_arr_2[7];
					var i_no_of_days = a_split_arr_2[8];

					if (i_bill_no_2 == a_bill_array_2[b_2]) {
						i_no_of_days_VAR = i_no_of_days;

						if (!_logValidation(a_lines_array)) {
							a_lines_array = i_AP_line_item_ID_2;
						} else {
							a_lines_array = a_lines_array + ',' + i_AP_line_item_ID_2;
						}

						i_cnt++;

						var s_item_class = i_cnt + '_' + 'approduct_' + i_bill_no_2 + 'aplineid_' + i_AP_line_item_ID_2 + 'item_';
						var s_quantity_class = i_cnt + '_' + 'approduct_' + i_bill_no_2 + 'aplineid_' + i_AP_line_item_ID_2 + 'item_' + i_item_ID_2 + 'quantity_';
						var item_id_2 = i_cnt + '_' + 'approductitem' + '_' + i_bill_no_2;
						var quantity_id_2 = i_cnt + '_' + 'approductquantity' + '_' + i_bill_no_2;
						var unreconciledquantity_id_2 = i_cnt + '_' + 'approductunreconciledquantity' + '_' + i_bill_no_2;

						var i_ap_line_id = 'APLINE_' + i_AP_line_item_ID_2;

						if (i_status == 7) {
							//  i_quantity_2 = Math.abs(i_quantity_2);
							i_unreconcilled_qty_2 = Math.abs(i_unreconcilled_qty_2);

							//	i_quantity_2 = parseFloat(i_quantity_2)*parseFloat(-1);
							i_unreconcilled_qty_2 = parseFloat(i_unreconcilled_qty_2) * parseFloat(-1);
						}
						/*******
						  if((i_unreconcilled_qty == i_quantity_1) &&(i_unreconcilled_qty!=0))
			        	  {
				        	  strVar += "<tr  style=\"color:black\"  class = "+s_class_name+">";							  
			        	  }
				          if((i_unreconcilled_qty == 0))
			        	  {
				        	  strVar += "<tr  style=\"color:green\"  class = "+s_class_name+">";							  
			        	  }
				          if((i_unreconcilled_qty < i_quantity_1) &&(i_unreconcilled_qty!=0))
			        	  {
				        	  strVar += "<tr  style=\"color:red\"  class = "+s_class_name+">";							  
			        	  }
				          ///////6 Jan 2016
				          
				          
				          if((i_unreconcilled_qty > i_quantity_1) &&(i_unreconcilled_qty!=0))
			        	  {
				        	  strVar += "<tr  style=\"color:red\"  class = "+s_class_name+">";							  
			        	  }		
						  **********/
						if (i_status == 7) {
							var s_class_name = 'aptrstyle2'

							if (((i_unreconcilled_qty_2 == i_quantity_2) && (i_unreconcilled_qty_2 != 0)) || (i_unreconcilled_qty_2 < 0)) {
								strVar += "<tr  style=\"color:black\"  class = " + s_class_name + ">";
							}
							if ((i_unreconcilled_qty_2 == 0)) {
								strVar += "<tr  style=\"color:green\"  class = " + s_class_name + ">";
							}
							if ((i_unreconcilled_qty_2 < i_quantity_2) && (i_unreconcilled_qty_2 != 0) && (i_unreconcilled_qty_2 > 0)) {
								strVar += "<tr  style=\"color:red\"  class = " + s_class_name + ">";
							}
							///////6 Jan 2016

							if ((i_unreconcilled_qty_2 > i_quantity_2) && (i_unreconcilled_qty_2 != 0) && (i_unreconcilled_qty_2 > 0)) {
								strVar += "<tr  style=\"color:red\"  class = " + s_class_name + ">";
							}
						}
						if (i_status != 7) {
							var s_class_name = 'aptrstyle2'

							if ((i_unreconcilled_qty_2 == i_quantity_2) && (i_unreconcilled_qty_2 != 0)) {
								strVar += "<tr  style=\"color:black\"  class = " + s_class_name + ">";
							}
							if ((i_unreconcilled_qty_2 == 0)) {
								strVar += "<tr  style=\"color:green\"  class = " + s_class_name + ">";
							}
							if ((i_unreconcilled_qty_2 < i_quantity_2) && (i_unreconcilled_qty_2 != 0)) {
								strVar += "<tr  style=\"color:red\"  class = " + s_class_name + ">";
							}
							///////6 Jan 2016


							if ((i_unreconcilled_qty_2 > i_quantity_2) && (i_unreconcilled_qty_2 != 0)) {
								strVar += "<tr  style=\"color:red\"  class = " + s_class_name + ">";
							}
							/*
							  
							  if((i_unreconcilled_qty_2 == i_quantity_2) &&(i_unreconcilled_qty_2!=0 || i_unreconcilled_qty_2 == ''))
				        	  {
					        	  strVar += "<tr  style=\"color:black\"  class = aptrstyle2>";							  
				        	  }
					          if((i_unreconcilled_qty_2 == 0) && (i_unreconcilled_qty_2 != ''))
				        	  {
					        	  strVar += "<tr  style=\"color:green\"  class = aptrstyle2>";							  
				        	  }
					          if((i_unreconcilled_qty_2 < i_quantity_2) &&(i_unreconcilled_qty_2!=0))
				        	  {
					        	  strVar += "<tr  style=\"color:red\"  class = aptrstyle2>";							  
				        	  }	
				        	  */
						}

						i_quantity_2 = parseFloat(i_quantity_2).toFixed(1);
						i_unreconcilled_qty_2 = parseFloat(i_unreconcilled_qty_2).toFixed(1);


						// strVar += "<tr class = aptrstyle2 >"
						strVar += "<td align=\"center\" width=\"25%\"  id = " + item_id_2 + " class = " + item_id_2 + ">" + s_item_txt_2 + "<div style=\"display:none\">" + i_ap_line_id + "</div><\/td>"
						strVar += "<td align=\"center\" width=\"10%\" id = " + quantity_id_2 + " class = " + quantity_id_2 + ">" + i_quantity_2 + "<\/td>"
						strVar += "<td align=\"center\" width=\"10%\" id = " + unreconciledquantity_id_2 + " class = " + unreconciledquantity_id_2 + " >" + i_unreconcilled_qty_2 + "<\/td>"
							//  strVar += 		"<td align=\"center\" width=\"10%\" id = cv class = cv1 >"+i_unreconcilled_qty_2+"<\/td>" 
						strVar += "<\/tr>";
					}
				}
				strVar += "<\/table><\/td><\/tr>";
				//strVar += "<table>";		    

				strVar += "<tr><td width=\"45%\">"
				strVar += "<table  width=\"100%\">"
				strVar += "<tr>"
				if (i_no_of_days_VAR >= 7) {
					strVar += "<td align=\"left\" class = outstanding width=\"55%\">OUTSTANDING<\/td>"
				} else {
					strVar += "<td align=\"left\" width=\"55%\"><\/td>"
				}

				if (i_status != 6 && i_status != 7 && i_status != 8) {
					if (i_status == 1) {
						strVar += "<td align=\"right\" width=\"15%\"><button onclick=\"deliver(" + a_bill_array_2[b_2] + ");\" class=\"deliver\"  >Deliver<\/button><\/td>"
					} else {
						strVar += "<td align=\"right\" width=\"15%\"><\/td>"
					}


					strVar += "<td align=\"right\" width=\"15%\"><button onclick=\"edit_2(" + i_customer_ID + "," + a_bill_array_2[b_2] + ");\" class=\"edit\"  >Edit<\/button><\/td>"
					strVar += "<td align=\"right\" width=\"15%\"><button onclick=\"cancel(" + a_bill_array_2[b_2] + ");\" class=\"cancel\"  >Cancel<\/button><\/td>"
				} else {
					strVar += "<td align=\"right\" width=\"15%\"><\/td>"
					strVar += "<td align=\"right\" width=\"15%\"><\/td>"
					strVar += "<td align=\"right\" width=\"15%\"><\/td>"
				}

				strVar += "<\/tr>";

				strVar += "<\/table>";
				strVar += "<\/td><\/tr>";

				strVar += "<\/table>";
				strVar += "<table>";
				strVar += "<tr><td width=\"25%\" align=\"left\"><\/td><td width=\"20%\" align=\"right\"><\/td><\/tr>";
				strVar += "<tr><td width=\"25%\" align=\"left\"><\/td><td width=\"25%\" align=\"right\"><\/td><\/tr>";
				strVar += "<tr><td width=\"25%\" align=\"left\"><\/td><td width=\"20%\" align=\"right\"><\/td><\/tr>";
				strVar += "<tr><td width=\"25%\" align=\"left\"><\/td><td width=\"20%\" align=\"right\"><\/td><\/tr>";
				strVar += "<\/table>";
			}
		}
		strVar += "<\/td>";
		strVar += "<td width = 2%><\/td>";
		strVar += "<\/tr>";
		strVar += "<\/table>";
		strVar += "<\/div>";
		strVar += "<\/td>";



		strVar += "<\/tr>";
		strVar += "<\/table>";


		strVar += "<table  width=\"100%\">";
		strVar += "<tr>"
		strVar += "<td width=\"50%\" align=\"right\"><\/td";
		strVar += "<tr><td width=\"50%\" align=\"center\"><button onclick=\"add_new_order_2();\" class=\"addneworder\"  >Add New Order<\/button><\/td><\/tr>";

		//strVar += "<td width=\"50%\" align=\"center\"><a href=\""+URL_ADD_NEW_ORDER+"\" class=\"addneworder\">Add New Order<\/a><\/td>"
		strVar += "<\/tr>";
		strVar += "<\/table>";
		strVar += "<table  class = tab width=\"100%\">";
		// strVar += "<tr><td width=\"100%\" align=\"center\"><div id=\"myProgress\">out of 30<\/div><\/td><\/tr>";	

		/////////// 6 Jan 2016


		/*
	
		///////////////////////////////////////////////////////////////////////////
		strVar += "<tr><td style=\"display:none\" width=\"100%\" align=\"center\">";
		strVar += "<div id=\"myProgress\">";
		strVar += "  <div id=\"myBar\">";
	
		var matchings_text = matchings+' '+'out of 30'
	
		strVar += "    <div id=\"label\">"+matchings_text+"<\/div>";
		strVar += "  <\/div>";
		strVar += "<\/div>";	
		strVar += "<\/td><\/tr>";
		///////////////////////////////////////////////////////////////////////////
		*/

		/////////////  style=\"display:none\"


		strVar += "<tr><td  style=\"display:none\" width=\"100%\" align=\"center\" class = tabtd>" + reconcile_Array_before_Load + "<\/td><\/tr>";
		//strVar += "<tr><td  width=\"100%\" align=\"center\" class = tabtd><\/td><\/tr>";

		strVar += "<tr><td width=\"100%\" align=\"center\"><button onclick=\"createInput();\" class=\"reconcile\"  >Reconcile<\/button><\/td><\/tr>";

		// strVar += "<tr><td width=\"100%\" align=\"center\"><button type=\"button\" class=\"reconcile\" id=\"reconcile\">Reconcile</button><\/td><\/tr>";	

		// strVar += "<tr><td width=\"100%\" align=\"center\"><a href=\"https:\/\/system.sandbox.netsuite.com\/app\/site\/hosting\/scriptlet.nl?script=603&deploy=1&reconcile_array=\"+a_reconcile_array\" class=\"reconcile\"   id=\"reconcile\">Reconcile<\/a><\/td><\/tr>";	
		strVar += "<\/table>";
		strVar += "<\/body>";
		strVar += "<\/html>";

		f_reconcile_ui.setDefaultValue(strVar);
	} catch (ex) {
		nlapiLogExecution("DEBUG", "error", ex);
	}
}

function get_product_reconcilliation_page_parameters() {
	var a_data_array = new Array();

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_jquery_library_file');
	columns[2] = new nlobjSearchColumn('custrecord_item_unauthorized');

	var a_search_results = nlapiSearchRecord('customrecord_product_reconcilliation_pag', null, null, columns);

	if (_logValidation(a_search_results)) {
		var URL_JQuery_library_file = a_search_results[0].getValue('custrecord_jquery_library_file');
		var URL_JQuery_CSS_file = '' // a_search_results[0].getValue('custrecord_jquery_css_file');
		var i_unauthorized_item = a_search_results[0].getValue('custrecord_item_unauthorized');

		a_data_array[0] = {
			'jquery_lib_file': URL_JQuery_library_file,
			'jquery_css_file': URL_JQuery_CSS_file,
			'unauthorized_item': i_unauthorized_item
		};

	} //Search Results
	return a_data_array;
} //Product Reconcilliation Page Parameters

function product_reconcilliation_mappings(i_user) {
	var columns = new Array();
	var a_filters = new Array();

	columns[0] = new nlobjSearchColumn('internalid');
	a_filters[0] = new nlobjSearchFilter('custrecord_partner_user', null, 'is', i_user);

	var a_search_results = nlapiSearchRecord('customrecord_pr_mappings', null, a_filters, columns);

	if (_logValidation(a_search_results)) {
		var i_pr_mappings_ID = a_search_results[0].getValue('internalid');

		i_value = i_pr_mappings_ID;
	}
} //Product Recon Mappings



/*
function product_reconcilliation_mappings(i_user)
{
	var i_value = '';
	var columns = new Array();
	var a_filters = new Array();
	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_fully_reconciled_mappings');
    a_filters[0] = new nlobjSearchFilter('custrecord_partner_user', null, 'is', i_user);
    nlapiLogExecution('DEBUG', 'post_restlet_function', ' ------ Product   i_user-->'+i_user);
	var a_search_results = nlapiSearchRecord('customrecord_pr_mappings', null, a_filters, columns);
	 	
	if(_logValidation(a_search_results))
	{
		 var i_pr_mappings_ID = a_search_results[0].getValue('internalid');
		 
		 var i_pr_mappings_array = a_search_results[0].getValue('custrecord_fully_reconciled_mappings');
		 
		 i_value = i_pr_mappings_array;		
	}
	else
	{
		 var o_product_mappingsOBJ = nlapiCreateRecord('customrecord_pr_mappings',{recordmode: 'dynamic'});
		 o_product_mappingsOBJ.setFieldValue('custrecord_apbill_approduct_mappings','');
		 o_product_mappingsOBJ.setFieldValue('custrecord_partner_user',i_user);
		 var i_submit_product_mappingsID = nlapiSubmitRecord(o_product_mappingsOBJ,true,true);
		 nlapiLogExecution('DEBUG', 'post_restlet_function', ' ------ Product Reconcilliation Mappings Submit ID {CREATE}-->'+i_submit_product_mappingsID);
	}	
	return i_value;
}//Product Reconcilliation Mappings

*/


// GET THE UNMATCH FILE 
function get_Unmatch_File(i_user) {
	var i_value = '';

	var columns = new Array();
	var a_filters = new Array();

	columns[0] = new nlobjSearchColumn('internalid');
	columns[1] = new nlobjSearchColumn('custrecord_unmatching_csv_file');
	a_filters[0] = new nlobjSearchFilter('custrecord_partner_user', null, 'is', i_user);
	var a_search_results = nlapiSearchRecord('customrecord_pr_mappings', null, a_filters, columns);

	if (_logValidation(a_search_results)) {
		var i_pr_mappings_ID = a_search_results[0].getValue('internalid');

		var i_pr_unmatch = a_search_results[0].getValue('custrecord_unmatching_csv_file');
		if (_logValidation(i_pr_unmatch)) {
			i_value = i_pr_unmatch;
		}
	}
	return i_value;
}
//SCROLL FUNCTION 
function GetAp_Bill_Order_Final_Label(a_ap_bill_customerData, i_bill_1_G, type) {
	var a_ap_bill_customerData_splitter = a_ap_bill_customerData.toString().split('####');
	for (var bb = 0; bb < a_ap_bill_customerData_splitter.length; bb++) {
		var s_inner_data_splitter = a_ap_bill_customerData_splitter[bb].split('@@@');

		if (s_inner_data_splitter[0] == i_bill_1_G) {
			// IFF DROP AREA IS AP BILL THEN GET AP ORDER DATA 
			if (type == 'apbill') {
				var ID = s_inner_data_splitter[0];
				var A_assignment = s_inner_data_splitter[1];
				var final_String = 'Assignment #:' + A_assignment + '(' + ID + ')';
				return final_String;
				break;
			};
			// IFF DROP AREA IS AP ORDER  THEN GET AP BILL DATA   
			if (type == 'aporder') {
				var ID = s_inner_data_splitter[0];
				var customerPO = s_inner_data_splitter[1];
				var a_Date = s_inner_data_splitter[2];
				var final_String = customerPO + ' - ' + a_Date + ' - Product Order #:' + ID;
				return final_String;
				break;

			}
		}
	}
}
//END OF SCROLL FUNCTION 
function replace_zero(d_date) {
	if (_logValidation(d_date)) {
		d_date = d_date.replace('01/', '1/');
		d_date = d_date.replace('02/', '2/');
		d_date = d_date.replace('03/', '3/');
		d_date = d_date.replace('04/', '4/');
		d_date = d_date.replace('05/', '5/');
		d_date = d_date.replace('06/', '6/');
		d_date = d_date.replace('07/', '7/');
		d_date = d_date.replace('08/', '8/');
		d_date = d_date.replace('09/', '9/');
	}
	return d_date;
} //Replace Zero


function get_partner(i_partner) {
	var print_str = '';

	print_str = "<option id = '' value=''><\/option>";

	var a_partner_search_results = nlapiSearchRecord("partner", null, [
		["email", "isnotempty", ""],
		"AND", ["formulatext:{giveaccess}", "is", "T"]
	], [
		new nlobjSearchColumn("internalid", null, null),
		new nlobjSearchColumn("entityid", null, null).setSort(),
		new nlobjSearchColumn("email", null, null),
		new nlobjSearchColumn("giveaccess", null, null),
		new nlobjSearchColumn("isinactive", null, null)
	]);
	if (_logValidation(a_partner_search_results)) {
		nlapiLogExecution('DEBUG', 'schedulerFunction', ' Partner Search Results -->' + a_partner_search_results.length);

		for (var p_t = 0; p_t < a_partner_search_results.length; p_t++) {
			var i_partnerID = a_partner_search_results[p_t].getValue('internalid');
			// nlapiLogExecution('DEBUG', 'schedulerFunction', ' Partner ID -->'+i_partnerID);	 

			var i_partner_name = a_partner_search_results[p_t].getValue('entityid');
			// nlapiLogExecution('DEBUG', 'schedulerFunction', ' Partner Name -->'+i_partner_name);	 

			if (i_partner == i_partnerID) {
				print_str += "<option id = " + i_partnerID + "  selected value=\"" + i_partnerID + "\">" + i_partner_name + "<\/option>";
			} else {
				print_str += "<option id = " + i_partnerID + " value=\"" + i_partnerID + "\">" + i_partner_name + "<\/option>";
			}
		}
	}
	return print_str;

} //Get Partner


function isPartner(i_user) {
	var f_partner = false;

	if (_logValidation(i_user)) {
		var columns = new Array();
		var a_filters = new Array();

		columns[0] = new nlobjSearchColumn('internalid');
		columns[1] = new nlobjSearchColumn('type');

		a_filters[0] = new nlobjSearchFilter('internalid', null, 'is', i_user);

		var a_search_results = nlapiSearchRecord('entity', null, a_filters, columns);

		if (_logValidation(a_search_results)) {
			for (var b_x = 0; b_x < a_search_results.length; b_x++) {
				var i_entity_ID = a_search_results[b_x].getValue('internalid');
				var i_entity_type = a_search_results[b_x].getValue('type');

				nlapiLogExecution('DEBUG', 'schedulerFunction', ' Entity ID --->' + i_entity_ID);
				nlapiLogExecution('DEBUG', 'schedulerFunction', ' Entity Type -->' + i_entity_type);

				if (i_entity_type == 'Partner' || i_entity_type == 'Vendor') {
					f_partner = true;
				}

			}
		}

	}
	return f_partner;

} //Partner


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


function remove_product_reconcilliation_data(i_PRD_ID) {
	if (_logValidation(i_PRD_ID)) {
		var blank = '';

		var o_PR_OBJ = nlapiLoadRecord('customrecord_product_reconciliation_data', i_PRD_ID, {
			recordmode: 'dynamic'
		});
		o_PR_OBJ.setFieldValue('custrecord_prd_unmatch_array', blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_bill_from_date', blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_product_to_date', blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_deliver', blank);
		//o_PR_OBJ.setFieldValue('custrecord_call_type',blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_linking_array', blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_unmatch_array_before_load', blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_product_from_date', blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_unmatched_array_global', blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_cancel', blank);
		o_PR_OBJ.setFieldValue('custrecord_reconcile_array_bef_load', blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_confirm', blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_bill_to_date', blank);
		o_PR_OBJ.setFieldValue('custrecord_prd_reconcile_array', blank);
		o_PR_OBJ.setFieldValue('custrecord_customer_id', blank);
		o_PR_OBJ.setFieldValue('custrecord_edit_product_order_id', blank);
		o_PR_OBJ.setFieldValue('custrecord_dispute_ap_bill_id', blank);
		o_PR_OBJ.setFieldValue('custrecord_dispute_type', blank);
		o_PR_OBJ.setFieldValue('custrecord_dispute_file_upload', blank);
		o_PR_OBJ.setFieldValue('custrecord_dispute_upload_file_id', blank);
		o_PR_OBJ.setFieldValue('custrecord_dispute_file_type', blank);
		o_PR_OBJ.setFieldValue('custrecord_add_new_order_product_recon', blank);
		o_PR_OBJ.setFieldValue('custrecord_dispute_upload_file_id', blank);
		o_PR_OBJ.setFieldValue('custrecord_add_new_order_product_orderid', blank);
		o_PR_OBJ.setFieldValue('custrecord_add_new_order_customer_id', blank);


		var i_submit_product_data = nlapiSubmitRecord(o_PR_OBJ, true, true);
		nlapiLogExecution('DEBUG', 'schedulerFunction', ' ------- Product Reconcilliation Data --------- -->' + i_submit_product_data);

	} //Product Reconcilliation Data
} //Product Reconcilliation Data

function  is_AP_Bill_fully_reconciled(i_AP_Bill_ID)
{
   var result = false;
   
	if(_logValidation(i_AP_Bill_ID))
	{
	   var filter = new Array();
	   filter[0] = new nlobjSearchFilter('custrecord_ap_stock_recon_status', null, 'is', 1);
	   filter[1] = new nlobjSearchFilter('internalid', null, 'is', i_AP_Bill_ID);
	   
	   var columns = new Array();
	   columns[0] = new nlobjSearchColumn('internalid');
	  
	   var	a_search_results = nlapiSearchRecord('customrecord_mp_ap_stock_receipt',null,filter,columns);	
		
		if(_logValidation(a_search_results))
		{
		   for(var cn = 0 ;cn<a_search_results.length ;cn++)
		   {
			   var i_recordID = a_search_results[cn].getValue('internalid'); 
			   nlapiLogExecution('DEBUG', 'is_AP_Bill_fully_reconciled', '  AP Bill ID -->'+i_recordID);
			   result = true;
		   }//Loop Search Results		
		}//Search Results	
	}
	return result;
}

function  is_AP_Product_Order_fully_reconciled(i_AP_Product_ID)
{
   var result = false;
   
	if(_logValidation(i_AP_Product_ID))
	{
	   var filter = new Array();
	   filter[0] = new nlobjSearchFilter('custrecord_ap_order_recon_status', null, 'is', 1);
	   filter[1] = new nlobjSearchFilter('internalid', null, 'is', i_AP_Product_ID);
	   
	   var columns = new Array();
	   columns[0] = new nlobjSearchColumn('internalid');
	  
	   var	a_search_results = nlapiSearchRecord('customrecord_mp_ap_product_order',null,filter,columns);	
		
		if(_logValidation(a_search_results))
		{
		   for(var cn = 0 ;cn<a_search_results.length ;cn++)
		   {
			   var i_recordID = a_search_results[cn].getValue('internalid'); 
			   nlapiLogExecution('DEBUG', 'is_AP_Product_Order_fully_reconciled', '  AP Product Order ID -->'+i_recordID);
			   result = true;
		   }//Loop Search Results		
		}//Search Results	
	}
	return result;
}