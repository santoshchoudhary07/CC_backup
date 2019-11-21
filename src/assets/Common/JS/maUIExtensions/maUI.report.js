if (!maUI) {
	throw new Error("maUI not loaded. maUI.report requires maUI.");
} else {
	(function () {
		if (!maUI.report) {
			maUI.report = {};
		}

		//enum for FileTypes
		maUI.report.FileTypes = {
			EXCEL: "excel",
			PDF: "pdf",
			properties: {
				excel: {
					name: "Excel",
					extention: "xlsx",
					endpoint: {
						generate: "/Report/GenerateExcelFile/",
						download: "/Report/DownloadExcel"
					}
				},
				pdf: {
					name: "Pdf",
					extention: "pdf",
					endpoint: {
						generate: "/Report/GeneratePdfFile/",
						download: "/Report/DownloadPdf"
					}
				}
			}
		}


		//main download function
		maUI.report.downloadFile = function downloadFile(reportId, params, fileName, fileType) {
			//wrap into a Promise so that the calling process can react
			var paramsObj = maUI.report.paramsToObject(params)
			return new Promise(function (resolve, reject) {
				var dataObject = {
					reportParameters: buildParameterArray(paramsObj)
				};
				var fileTypeProp = maUI.report.FileTypes.properties[fileType.toLowerCase()];
				if (!fileTypeProp) throw new Error("Unknown File Type: " + fileType);

				$.ajax({
					cache: false,
					type: "POST",
					url: fileTypeProp.endpoint.generate + reportId,
					data: dataObject,
					success: function (response) {
						window.location = fileTypeProp.endpoint.download + "?fileGuid=" + response.SessionHandle + "&filename=" + fileName + "." + fileTypeProp.extention;
						resolve(response);
					},
					error: function(response){
						console.log(response.responseText);
						reject(response);
					} 
				});
			});
		}

		//wrapper downloads "per type"
		maUI.report.downloadExcelFile = function downloadExcelFile(reportId, params, fileName) {
			return maUI.report.downloadFile(reportId, params, fileName, maUI.report.FileTypes.EXCEL);
		}
		maUI.report.downloadPdfFile = function downloadPdfFile(reportId, params, fileName) {
			return maUI.report.downloadFile(reportId, params, fileName, maUI.report.FileTypes.PDF);
		}		

		//open the dynamic report's page passing (optionally in a new window)
		//reportId is the id
		//params is the DOM element housing the "official" parameter elements (DDR naming convention)
        //isNewWindow determines if the report page should be in a new window
		maUI.report.openDynamicReport = function openDynamicReport(reportId, params, isNewWindow) {
			var form = document.createElement("form");
			form.method = "POST";
			form.action = "/report/dynamicreport/" + reportId;

			//populate the form (get a unique key for popping a window... if requested)
			var paramsObj = maUI.report.paramsToObject(params)
			var reportParamKey = createDynamicFormItems(form, paramsObj);

			if (!!isNewWindow) {
				form.target = "r" + reportId + reportParamKey; //if not exists... will create the new window?
			}
			document.body.appendChild(form);
			form.submit();
			document.body.removeChild(form); //cleanup
		}
		
		//converts params to a standard json object
		//if params is a dom container (either jquery or html element), the container will be searched for input or select elements
		//they must have a class of ".report-parameter" or ".report-parameter-select" respsectively
		//element "names" will be parsed and should work for both normal and complicated naming:
		//	normal: <input type="text" name="foo" value="bar"/>
		//  complex: <input type="text" name="reportParameters[0].foo" value="bar"/>
		//if object is NOT jquery or html element, then this will assume that params is already a standard object and return it.
		maUI.report.paramsToObject = function paramsToObject(params) {
			//if the params are a jquery object or a dom element... cast them to a json object
			if (maUI.util.isJQuery(params) || params instanceof Element) {
				return castFormParametersToJson(params);
			} else { //...otherwise, just return it (must already be an object?)
				return params;
			}
		}



		//--------------------------------------------------
		//private functions
		//--------------------------------------------------
				
		//convert "form" input parameters to standard json based object
		function castFormParametersToJson(paramContainer) {
			var parameters = new Object();
			// Basic Parameters
			$(".report-parameter", paramContainer).each(function () {
				var tokens = this.name.split(".");
				var key = tokens.length > 1 ? tokens[1] : tokens[0];
				parameters[key] = this.value;
			});
			// Select Parameters
			$(".report-parameter-select", paramContainer).each(function () {
				var value = $(this).find("option:selected").val();
				var tokens = this.name.split(".");
				var key = tokens.length > 1 ? tokens[1] : tokens[0];
				parameters[key] = value;
			});
			return parameters;
		}

		//create hidden "reportParameters" elements for each param in object and appends to a provided form 
		function createDynamicFormItems(form, params) {
			var reportParamKey = "";
			var i = 0;
			Object.keys(params).forEach(function (key) {
				var elemKey = document.createElement("input");
				elemKey.name = "reportParameters[" + i + "].Key";
				elemKey.value = key; //Key

				var elemVal = document.createElement("input");
				elemVal.name = "reportParameters[" + i + "].Value";
				elemVal.value = params[key]; //Value	

				form.appendChild(elemKey);
				form.appendChild(elemVal);

				reportParamKey += elemKey.value + elemVal.value;
				i++;
			});
			return reportParamKey;
		}

		//creates an array of key/value objects (for passing in report ajax)
		function buildParameterArray(params) {
			var arr = [];			
			Object.keys(params).forEach(function (key) {
				arr.push({
					key: key,
					value: params[key]
				});
			});
			return arr;
		}
		
	})();
}

