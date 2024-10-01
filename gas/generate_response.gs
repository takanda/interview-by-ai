function writeResponse(input) {
  const response = postInput(input);
  return response;
}

function postInput(input) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty("DIFY_API_KEY");
  console.log(apiKey);

  const url = "https://api.dify.ai/v1/workflows/run";
  const headers = {
    "Authorization": "Bearer " + apiKey,
    "Content-Type": "application/json",
  };

  const payload = {
    "inputs": {
      "input": input
    },
    "response_mode": "blocking",
    "user": "test",
  }

  const options = {
    "method": "post",
    "headers": headers,
    "payload": JSON.stringify(payload),
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseJson = JSON.parse(response.getContentText());
  return responseJson.data.outputs.text;

}


function checkSpeaker(name) {
  if (name === "interviewer") {
    return false;
  } else {
    return true;
  }
}
