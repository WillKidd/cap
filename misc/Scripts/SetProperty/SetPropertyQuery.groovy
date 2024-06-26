import com.sap.gateway.ip.core.customdev.util.Message;
import java.util.HashMap;
import groovy.json.JsonSlurper;

def Message processData(Message message) {
    def json = message.getBody(java.io.Reader);
    def data = new JsonSlurper().parse(json);
    if(!!data.query){
        message.setProperty("query", data.query);
    }else{
        message.setProperty("query", "*:*");
    }
    return message;
}