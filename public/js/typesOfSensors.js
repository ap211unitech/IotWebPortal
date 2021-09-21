function showThatTypeOfSensor(text) {
    if(text=="Temperature") return '<i class="fas fa-temperature-high"></i>';
    if(text=="Humidity") return '<i class="fas fa-tint"></i>';
    if(text=="Light Intensity") return '<i class="fas fa-sun"></i>';
    if(text=="Heart Beat") return '<i class="fas fa-heartbeat"></i>';
    if(text=="Snow") return '<i class="fas fa-snowflake"></i>';
    if(text=="Gas Station") return '<i class="fas fa-gas-pump"></i>';
    if(text=="Gas Measure") return '<i class="fas fa-burn"></i>';
    if(text=="Garbage") return '<i class="fas fa-trash-alt"></i>';
    if(text=="Pressure") return '<i class="fas fa-tachometer-alt"></i>';
    if(text=="Bacteria") return '<i class="fas fa-bacteria"></i>';
    if(text=="Animals") return '<i class="fab fa-sticker-mule"></i>';
    if(text=="Location") return '<i class="fas fa-map-marker-alt"></i>';
    if(text=="Charging Station") return '<i class="fas fa-charging-station"></i>';
}