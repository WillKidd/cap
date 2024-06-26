import com.sap.gateway.ip.core.customdev.util.Message;
import java.util.HashMap;
import groovy.json.JsonSlurper;
import groovy.json.JsonOutput

def Message processData(Message message) {
    def json = message.getBody(java.io.Reader);
    def data = new JsonSlurper().parse(json);
    def baseErrorMsg = ["Validation error: ", " is required but was not provided."];
    def errorMsg;
    if (!data.customerID){
        errorMsg = "Customer ID";
    } else if (!data.items || data.items.isEmpty()){
        errorMsg = "Items";
    }
    if (errorMsg){
        throw new Exception(baseErrorMsg[0] + errorMsg + baseErrorMsg[1]);
    }
    return message;
}