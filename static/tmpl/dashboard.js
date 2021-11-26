TEMPLATE_CARD_DEFAULT = `
<div class="dsh_card_item" style="top: 8%">Брутто: <span>0</span></div>
<div class="dsh_card_item" style="top: 16%">Брак: <span>0%</span></div>
<div class="dsh_card_item" style="top: 24%">Перевес: <span>0%</span></div>
<div class="dsh_card_item" style="top: 40%">Коробок: <span>0</span></div>
<div class="dsh_card_item" style="top: 48%">Штук: <span>0</span></div>
<div class="dsh_card_item" style="top: 56%">План: <span>0%</span></div>
<div class="dsh_card_item_big" style="top: 76%;">{fs_name}</div>
<div id="status_{fs}" class="dsh_card_item_status" style="top: 86%; background-color: red;"><span id="status_text_{fs}"class="text_status">Нет связи</span></div>
`;
TEMPLATE_CARD = `
<div class="dsh_card_item" style="top: 8%">Брутто: <span>{weight}</span></div>
<div class="dsh_card_item" style="top: 16%">Брак: <span style="color: {procent_brak_color};">{procent_brak}%</span></div>
<div class="dsh_card_item" style="top: 24%">Перевес: <span style="color: {procent_pereves_color};">{procent_pereves}%</span></div>
<div class="dsh_card_item" style="top: 40%">Коробок: <span>{count_packages}</span></div>
<div class="dsh_card_item" style="top: 48%">Штук: <span>{total_fact}</span></div>
<div class="dsh_card_item" style="top: 56%">План: <span style="color: {procent_plan_color}">{procent_plan}%</span></div>
<div class="dsh_card_item_big" style="top: 76%;">{fs_name}</div>
<div id="status_{fs}" class="dsh_card_item_status" style="top: 86%; background-color: {fs_status_color};"><span id="status_text_{fs}"class="text_status">{status_text}</span></div>
`;

function drow_graf(container_id, title, data_graf) {
    console.log("drow_graf container_id, title, data_graf", container_id, title, data_graf);
    // data_graf = [
    //     ["9", 2],
    //     ["10", 7],
    //     ["11", 6],
    //     ["12", 10],
    //     ["13", 10],
    //     ["14", 100,"#ff3333", null, {enabled: true}],
    //     ["15", 10],
    //     ["16", 0],
    //     ["17", 10,"#ff3333", null, {enabled: true}],
    //     ["18", 10],
    //     ["19", 256,"#90EE90", null, {enabled: true}],
    //     ["20", 10],
    //     ["21", 10],
    //   ]

    $("#"+container_id).html("");
    var data = anychart.data.set(data_graf);
    var seriesData_1 = data.mapAs({x: 0, value: 1, fill: 2, stroke: 3, label: 4});
    chart = anychart.column();
    var series1 = chart.column(seriesData_1);

    chart.title(title)
    chart.container(container_id);
    chart.draw();

    $(".anychart-credits").hide();
}
function render(data){
    console.log(data);
    for(fs in data){
        if(data[fs]["status"]=="not_connect"){
            $("#status_" + fs).css('background-color', 'red');
            $("#status_text" + fs).html('нет связи')
            continue
        }
        if(data[fs]["status"]=="inwork"){
            data[fs]["status_text"] = "Работает";
            data[fs]["fs_status_color"] = "green";
        }
        if(data[fs]["procent_brak"] > 6){
            data[fs]["procent_brak_color"] = "red";
        }else{
            data[fs]["procent_brak_color"] = "green";
        }
        if(data[fs]["procent_pereves"] > 51.41){
            data[fs]["procent_pereves_color"] = "red";
        }else if(data[fs]["procent_pereves"] > 34.41){
            data[fs]["procent_pereves_color"] = "gold";
        }else{
            data[fs]["procent_pereves_color"] = "green";
        }
        if (fs=="weigh1"){
            var graf_title = "Цех упаковка. Штук - Время"
            data[fs]["fs_name"] = "Цех упаковка";
        }else{
            var graf_title = "Цех ломтики. Штук - Время"
            data[fs]["fs_name"] = "Цех ломтики";
        }
        var fscard_html = render_template(TEMPLATE_CARD,data[fs],[]);
        $("#card_"+fs).html(fscard_html);
        var graf_id = "graf_" + fs;
        var prods_by_hours = data[fs]["prods_by_hours"];
        var prods_for_graf = [];
        var max_cnt = 0;
        for(i in prods_by_hours){
            var cur_cnt = (prods_by_hours[i]["prods_list"]).length;
            console.log("prods_by_hours[i]['prods_list']", prods_by_hours[i]["prods_list"]);
            if (cur_cnt>max_cnt){
                max_cnt = cur_cnt
            }
            prods_for_graf.push([prods_by_hours[i]["hour"], cur_cnt])
        }
        for(i in prods_for_graf){
            if(prods_for_graf[i][1]*2 > max_cnt){
                (prods_for_graf[i]).push("#90EE90");
            }else{
                (prods_for_graf[i]).push("#ff3333");
            }
            (prods_for_graf[i]).push(null);
            (prods_for_graf[i]).push({enabled: true});
        }
        prods_for_graf.sort(function(a, b) {
            return a[0]>b[0];
          });
        drow_graf(graf_id,graf_title, prods_for_graf)
    }
}

function main(){
    query("get","/dashboard_get_values",{},render);
}

function set_default_cards(){
    var fscard1_html = render_template(TEMPLATE_CARD_DEFAULT,{fs:"weigh1",fs_name:"Цех упаковка"},[]);
    var fscard2_html = render_template(TEMPLATE_CARD_DEFAULT,{fs:"weigh2",fs_name:"Цех ломтики"},[]);
    $("#card_weigh1").html(fscard1_html);
    $("#card_weigh2").html(fscard2_html);
    main();
}

$( document ).ready(function() {
    set_default_cards();
    setInterval(main, 300000);
});