//在admin.html檔案中引用config.js檔案後, 即可在此顯示測試看看是否有抓到API的路徑與token
//console.log(`api_path=${api_path}, token=${token}`);

//API所需的headers設為一個物件, 以利直接帶入即可使用
const headers = {
  'Authorization': token
};

//針對訂單列表(HTML的<tbody>標籤)進行綁定
const orderList = document.querySelector(".js-orderList");

//針對清除全部訂單的按鈕進行綁定
const discardAllBtn = document.querySelector(".discardAllBtn");

//針對兩張圓餅圖的下拉式選單進行綁定
const selectPie = document.querySelector(".selectPie");

//訂單的資料
let orderData = [];

//c3.js函式繪製全產品類別營收比重時, 所使用的資料儲存空間
let OrderProductCategoryForC3 = [];

//c3.js函式繪製全品項營收比重時, 所使用的資料儲存空間
let AllProductsOfOrdersForC3 = [];

function init() {
  getOrderList();
};

init();

//取得訂單列表的資料
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {headers})
    .then(function (response) {
      orderData = response.data.orders;
      //console.log(orderData);

      //將訂單資料顯示出來, 且在該函式中, 呼叫將訂單資料進行依創建時間戳大小排序的函式, 以利將資料依時間新舊排序呈現
      renderOrderList();

      //統計所有訂單內各個產品分類與總金額
      tinyOrderProductCategory();

      //將所有訂單的各項產品及金額進行統計
      tinyAllProductsOfOrders();
    })
    .catch(function (response) {
      console.log(response);
    })
}

//將訂單資料依照創建時間戳的大小排序(最新創建者會排在最上方)
function sortOrderData(){
  orderData.sort(function(a, b){
    if(a.createdAt < b.createdAt){
      return 1; //當a[1]值 < b[1]值為true時, 代表b[1]較a[1]更大, 故把b放在a的前面, 數值越大者將被排得越前面
    }else{
      return -1; //當a[1]值 < b[1]值為false時, 代表b[1]較a[1]更小, 故把b放在a的後面, 數值越大者將被排得越前面
    }
  });
};


//將訂單列表的資訊組合成完整HTML, 且在刪除該品項標籤裡, id的後方加入data-id, 令每個產品的刪除按鈕都有各自的id, 以利監聽事件監聽是否有某某產品的"刪除"按鈕已被點擊到了, 即可做出後續處理; 此外因為我們想要做出當點擊到刪除按鈕時, 才做後續處理, 若點擊到該ul裡的其他地方則不執行任何動作, 因此需要在刪除產品的標籤內自行加入一個id
function renderOrderList() {

  //將訂單資料依照創建時間戳的大小排序(最新創建者會排在最上方)
  sortOrderData();
  
  let str = "";
  orderData.forEach(function (item, index) {
    let orderProductsTitle = "";
    let orderDate = "";
    let orderOperationStats = "";

    //每筆訂單內可能不只包含一個產品, 有可能有兩個以上的產品, 故需要把該訂單內的所有品項都撈出來做顯示
    item.products.forEach(function (item, index) {
      orderProductsTitle += item.title + "<br>";
    });

    //將訂單的日期時間透過函式進行轉換
    orderDate = transferToDateTime(item.createdAt);

    //判斷該筆訂單是否已經付款, 若true(在API回傳的結果, 此資料為布林值而非字串, 因此下方if判斷式內的true不可加上雙引號)則顯示已處理; 反之則顯示未處理
    if(item.paid === true){
      orderOperationStats = "已處理";
    }else{
      orderOperationStats = "未處理";
    }

    str += combimeOrderListHTML(item, orderProductsTitle, orderDate, orderOperationStats);
  });
  orderList.innerHTML = str;
};

//將訂單列表組合成HTML字串
function combimeOrderListHTML(item, orderProductsTitle, orderDate, orderOperationStats) {

  let str = `
  <tr>
    <td>${item.id}</td>
    <td>
      <p>${item.user.name}</p>
      <p>${item.user.tel}</p>
    </td>
    <td>${item.user.address}</td>
    <td>${item.user.email}</td>
    <td>
      <p>${orderProductsTitle}</p>
    </td>
    <td>${orderDate}</td>
    <td class="orderStatus">
      <a href="#" class="orderOperation" data-id="${item.id}">${orderOperationStats}</a>
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
    </td>
  </tr>`;

  return str;
};

//將訂單的毫秒(ms)轉成日期時間(請記得先乘上1000再進行轉換), 參考來源:https://www.delftstack.com/zh-tw/howto/javascript/javascript-convert-timestamp-to-date/,因訂單創建的日期時間(即訂單API的createdAt屬性)是JavaScript的時間戳, 它是以毫秒為單位, 而如果要把它轉成人類可懂的日期時間,則要將該時間戳乘上1000, 使其成為秒為單位的值, 且將這個時間戳傳給Date物件的建構式, 便可獲得該時間戳的日期時間物件
function transferToDateTime(unixTimestamp) {
  let jsTimestamp = new Date(unixTimestamp * 1000);

  let year = jsTimestamp.getFullYear();

  //因為getMonth()會回傳當時的月份(0到11), 故需要自行+1 (1到12)
  let month = jsTimestamp.getMonth() + 1;
  month = checkZero(month);

  let day = jsTimestamp.getDate();
  day = checkZero(day);

  let hours = jsTimestamp.getHours();
  hours = checkZero(hours);

  let minutes = jsTimestamp.getMinutes();
  minutes = checkZero(minutes);

  let seconds = jsTimestamp.getSeconds();
  seconds = checkZero(seconds);

  let orderDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;

  return orderDate;
};

//確認函式所收到的數字是否小於10, 如果是則將其前方補0後回傳
function checkZero(item) {
  return (item < 10 ? '0' : '') + item;
};

//將所有訂單的各個產品分類及總金額進行統計
function tinyOrderProductCategory() {
  let tempObj = {};
  //因每筆訂單內可能不只包含一個產品, 可能會有兩個以上的產品, 故將每一筆訂單內的每一種產品分類與總金額進行統計
  orderData.forEach(function (item, index) {
    item.products.forEach(function (item, index) {
      //若物件內沒有該產品種類, 則值為null而非""(空字串)
      if (tempObj[item.category] == null) {
        tempObj[item.category] = item.price;
      } else {
        //tempObj[item.title]代表取出該品項的值(也就是取出該品項的金額), 而因為物件的值是字串型態, 故需要先將其轉型為整數後,才能跟本次的產品金額相加
        tempObj[item.category] = parseInt(tempObj[item.category]) + parseInt(item.price);
      }
    });
  });

  //將現有物件資料調整為c3.js所接受的"陣列內有多個小陣列"的格式
  OrderProductCategoryForC3 = chageObjToArrForC3js(tempObj);

  //將資料傳給c3.js函式繪製全產品類別營收比重的圓餅圖
  drawAllItemsPie(OrderProductCategoryForC3);
};

//使用C3.js繪圖_後台作業LV1:製作圓餅圖，做全產品類別營收比重，類別含三項，共有：床架、收納、窗簾
function drawAllItemsPie(arr) {
  const chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: "pie",
      columns: arr,
    },
    /*color物件必須要擺在data:{}之外, 如果是使用"color", 則可搭配pattern及顏色色碼, 其內不需寫明data物件裡columns屬性的名稱, 個人覺得使用起來比較簡便, 但缺點是就不曉得哪個屬性對應的顏色是什麼, 要先自己測試好再將色碼填入pattern內; 如果要使用"colors"(尾字多一個s), 則需要寫明data物件裡columns屬性的名稱, 例如:
    colors: {
      "床架":"#DACBFF",
      "收納":"#9D7FEA",
      "窗簾":"#5434A7"
    } */
    color: {
      //依序為窗簾, 床架和收納
      pattern: ["#5434A7", "#DACBFF", "#9D7FEA"]
    }
  });
};


//將所有訂單的各項產品及金額進行統計
function tinyAllProductsOfOrders() {
  let tempObj2 = {};
  //因每筆訂單內可能不只包含一個產品, 可能會有兩個以上的產品, 故將每一筆訂單內的每一個產品名稱與總金額進行統計
  orderData.forEach(function (item, index) {
    item.products.forEach(function (item, index) {

    //將該訂單內該項目的總金額計算出來
    let thisItemTotalPrice = item.price * item.quantity;

    //若物件內沒有該產品品項, 則值為null而非""(空字串)
    if (tempObj2[item.title] == null) {
      tempObj2[item.title] = thisItemTotalPrice;
    } else {
      //tempObj2[item.title]代表取出該品項的值(也就是取出該品項的金額), 而因為物件的值是字串型態, 故需要先將其轉型為整數後,才能跟本次的產品金額相加
      tempObj2[item.title] = parseInt(tempObj2[item.title]) + parseInt(thisItemTotalPrice);
    }
    });
  });

  //將現有物件資料調整為c3.js所接受的"陣列內有多個小陣列"的格式, 呼叫函式後, 其回傳的資料格式為陣列格式
  AllProductsOfOrdersForC3 = chageObjToArrForC3js(tempObj2);

  //將該陣列的第二個值進行比較, 目的是要進行降冪排列(由大至小排序)
  //寫法參考自:https://ithelp.ithome.com.tw/articles/10225733
  AllProductsOfOrdersForC3.sort(function(a, b){
    if(a[1] < b[1]){
      return 1; //當a[1]值 < b[1]值為true時, 代表b[1]較a[1]更大, 故把b放在a的前面, 數值越大者將被排得越前面
    }else{
      return -1; //當a[1]值 < b[1]值為false時, 代表b[1]較a[1]更小, 故把b放在a的後面, 數值越大者將被排得越前面
    }
  });

  //console.log("AllProductsOfOrdersForC3排序之後, 結果如下");
  //console.log(AllProductsOfOrdersForC3);

  let count = 0;
  let tempArr = [];
  //只將營收最高的前三名名稱完整列於圓餅圖上, 其餘第四名至第八名全部歸納為"其它"
  AllProductsOfOrdersForC3.forEach(function(item, index){
    if(index >= 3){
      count += parseInt(item[1]);
    }
  });
  
  //刪除陣列內自index為3以後的6筆項目, 亦包含index為3本身那一項; 因為在此知道產品最多共有8種, 所以把index為3~8的全部刪除掉, 所以最多會有6筆項目
  AllProductsOfOrdersForC3.splice(3,6);

  //將第四名至第八名全部歸納為"其它", 且將金額一併放入陣列內
  tempArr.push("其它");
  tempArr.push(count);
  //console.log(tempArr);

  //將組合好的["其它", xxx(金額)]陣列放入陣列內
  AllProductsOfOrdersForC3.push(tempArr);

  //將資料傳給c3.js函式繪製"全產品營收比重"的圓餅圖, 但此處暫不呼叫, 避免因兩者使用相同的<div>標籤位置, 而使此圖形蓋掉既有的"全產品類別營收比重"圖形, 只要等管理者在下拉式選單選擇後, 依其選擇項目再繪製對應圖形即可
  //drawAllItemsPie2(AllProductsOfOrdersForC3);
};


//使用C3.js繪圖_後台作業LV2:製作圓餅圖，做全品項營收比重，類別含四項，篩選出前三名營收品項，其他 4~8 名都統整為「其它」
function drawAllItemsPie2(arr) {
  const chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
      type: "pie",
      columns: arr,
    },
    /*color物件必須要擺在data:{}之外, 如果是使用"color", 則可搭配pattern及顏色色碼, 其內不需寫明data物件裡columns屬性的名稱, 個人覺得使用起來比較簡便, 但缺點是就不曉得哪個屬性對應的顏色是什麼, 要先自己測試好再將色碼填入pattern內; 如果要使用"colors"(尾字多一個s), 則需要寫明data物件裡columns屬性的名稱, 例如:
    colors: {
      "床架":"#DACBFF",
      "收納":"#9D7FEA",
      "窗簾":"#5434A7"
    } */
    color: {
      //依序為營收第一名, 營收第二名和營收第三名, 營收第四名到第八名(被歸內成"其它")
      pattern: ["#5434A7", "#DACBFF", "#9D7FEA", "#842B00"]
    }
  });
};

//將物件格式調整為c3.js能夠接受的資料格式
function chageObjToArrForC3js(tempObj){ 
  //c3.js的圓餅圖會自動依照傳入的資料數字, 產生對應百分比, 故不用特地計算金額的百分比進行顯示
  let c3Array = [];
  let newC3Array = [];
  c3Array = Object.keys(tempObj);

  c3Array.forEach(function (item, index) {
    let tempArr = [];
    tempArr.push(item);
    tempArr.push(tempObj[item]);
    newC3Array.push(tempArr);
  });
  //console.log(newC3Array);

  return newC3Array;
};

//訂單列表的監聽事件
orderList.addEventListener("click", function (e) {
  //加入preventDefault(); 取消默認的HTML <a>標籤行為
  e.preventDefault();

  //因為在訂單列表中有兩種按鈕(訂單處理情形與刪除訂單按鈕), 且均有埋設各自的class name和id, 故在此判斷管理者點擊到的是哪一個按鈕
  let orderClass = e.target.getAttribute("class");

  //抓取被點擊到的那一筆訂單狀態, 內部自行埋設的訂單id
  const operationItemId = e.target.getAttribute("data-id");

  //抓取被點擊到的那一筆訂單狀態, 其當前狀態 (如果是未處理, 則稍後呼叫API修改其為已處理(將資料改為ture); 反之, 則修改成未處理(將資料改為false))
  const operationText = e.target.text;

  //修改訂單狀態的API, 其需包含一個名稱為data的物件, 故先將data物件組合好之後, 再呼叫函式傳送過去給API使用
  let data = {};

  //當管理者點擊到訂單處理按鈕時
  if(orderClass === "orderOperation"){
    //將該筆"訂單id"與"下方調整後的訂單狀態"組合成一個data物件
    data.id = operationItemId;

    if(operationText === "未處理"){
      data.paid = true;
    }else{
      data.paid = false;
    }
    //修改訂單狀態資訊 (如當前為未處理, 則呼叫API改成已處理; 反之, 則呼叫API改成未處理)
    putOneOrder(data);
  }
  //當管理者點擊到刪除訂單按鈕時
  else if(orderClass === "delSingleOrder-Btn"){
    const delItemId = e.target.getAttribute("data-id");
    //刪除管理者點擊到的訂單項目, 且在該函式中跳出警告視窗, 告知管理者是否刪除成功
    delOneOrder(delItemId);
    return;
  }
  //當管理者點擊到訂單列表的其他位置, 不做任何反應
  else{
    return;
  }
});

//修改被點擊到的那一筆訂單狀態(未處理改成已處理; 反之, 改成未處理)
function putOneOrder(data) {
  //此處的{data}必定要擺在{headers}前方, 如果兩者擺放位置對換, 則此API會回傳403(非API本人使用)的錯誤訊息
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
  {
    data
  },
  {
    headers
  }).then(function (response) {
      orderData = response.data.orders;
      alert(`已調整訂單狀態完成`);
      renderOrderList();

    })
    .catch(function (response) {
      console.log(response);
    })
};

//刪除單一一張訂單資料
function delOneOrder(orderId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`, {headers})
    .then(function (response) {
      orderData = response.data.orders;
      //console.log(`已刪除訂單編號${orderId}完成`);
      alert(`已刪除訂單編號${orderId}完成`);
      renderOrderList();

      //刪除一筆訂單後, 呼叫函式來重新統計所有訂單內, 各個產品分類與總金額並由其內部呼叫c3.js函式重繪圓餅圖
      tinyOrderProductCategory();
    })
    .catch(function (response) {
      console.log(response);
    })
};

//清除全部訂單的按鈕監聽事件
discardAllBtn.addEventListener("click", function (e) {
  //加入preventDefault(); 取消默認的HTML <a>標籤行為
  e.preventDefault();

  //console.log(orderData.length);

  //若訂單資料的陣列長度為0, 代表已無訂單, 則直接在此擋掉管理者的需求, 而不需待執行完API後才告訴管理者目前已無資料
  if (orderData.length === 0) {
    alert(`目前已無訂單資料, 請勿重複點擊此按鈕`);
    return;
  }
  //刪除所有訂單
  derlAllOrders();

});

//清除全部訂單
function derlAllOrders() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`, {headers})
    .then(function (response) {
      orderData = response.data.orders;
      alert(`已刪除所有訂單資料`);
      renderOrderList();
      const emptyArr = [];
      //刪除所有訂單後, 呼叫c3.js繪圖函式且傳送一個空陣列資料過去, 代表已無任何資料
      drawAllItemsPie(emptyArr);
    })
    .catch(function (response) {
      console.log(response);
    })
};

//針對圓餅圖的下拉式選單綁定監聽事件, 依管理者選擇的項目進行c3.js重新繪圖(兩份資料都已在初始化階段時都完成整理,故呼叫函式後可以把圖形繪製出來)
selectPie.addEventListener("change",function(e){
  let getValueOfOption = e.target.value;

  //抓取圓餅圖的標題文字
  const chartTitle = document.querySelector(".section-title");

  if(getValueOfOption==="allCategoriesPie"){
    chartTitle.textContent = "全產品類別營收比重";
    //將資料傳給c3.js函式繪製"全產品類別營收比重"的圓餅圖
    drawAllItemsPie(OrderProductCategoryForC3);
    return;
  }else{
    chartTitle.textContent = "全品項營收比重";
    //將資料傳給c3.js函式繪製"全品項營收比重"的圓餅圖
    drawAllItemsPie2(AllProductsOfOrdersForC3);
    return;
  }
});