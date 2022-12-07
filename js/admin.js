//在admin.html檔案中引用config.js檔案後, 即可在此顯示測試看看是否有抓到API的路徑與token
console.log(`api_path=${api_path}, token=${token}`);

//針對訂單列表(HTML的<tbody>標籤)進行綁定
const orderList = document.querySelector(".js-orderList");

const discardAllBtn = document.querySelector(".discardAllBtn");

let orderData = [];

function init() {
  getOrderList();
};

init();

//取得訂單列表的資料
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
    headers: {
      'Authorization': token
    }
  })
    .then(function (response) {
      orderData = response.data.orders;
      console.log("orderData資料如下");
      console.log(orderData);
      renderOrderList();

      //統計所有訂單內各個產品分類與總金額
      tinyOrderProductCategory();

    })
    .catch(function (response) {
      console.log(response);
    })
}

//將所有訂單的各個產品分類及總金額進行統計
function tinyOrderProductCategory() {
  console.log("----orderData資料如下, 準備開始整理----");
  //console.log(orderData);
  let tempObj = {};

  //將每一筆訂單內的每一個產品的分類與金額進行統計
  orderData.forEach(function (item, index) {
    item.products.forEach(function (item, index) {
      //若物件內沒有該品項, 則值為null而非""(空字串)
      if (tempObj[item.category] == null) {
        tempObj[item.category] = item.price;
      } else {
        //物件屬性的值是字串, 故需要先轉型為整數後,才能跟本次的產品加額相加
        tempObj[item.category] = parseInt(tempObj[item.category]) + parseInt(item.price);
      }
    });
  });

  console.log(tempObj);

  //請先計算總營收後, 作為分母使用, 下方尚未把分母算出來
  //看看newC3Array可否用c3Array取代之, 待測試
  let c3Array = [];
  let newC3Array = [];
  c3Array = Object.keys(tempObj);
  //console.log(tempArray);
  c3Array.forEach(function (item, index) {
    let tempArr = [];
    tempArr.push(item);
    tempArr.push(tempObj[item]);
    newC3Array.push(tempArr);
  });
  console.log(newC3Array);

  //將資料傳給c3.js函式繪製全品項營收的圓餅圖
  drawAllItemsPie(newC3Array);
};

//將訂單列表的資訊組合成完整HTML, 且在刪除該品項標籤裡, id的後方加入data-id, 令每個產品的刪除按鈕都有各自的id, 以利監聽事件監聽是否有某某產品的"刪除"按鈕已被點擊到了, 即可做出後續處理; 此外因為我們想要做出當點擊到刪除按鈕時, 才做後續處理, 若點擊到該ul裡的其他地方則不執行任何動作, 因此需要在刪除產品的標籤內自行加入一個id
function renderOrderList() {
  let str = "";
  orderData.forEach(function (item, index) {
    let orderProductsTitle = "";
    let orderDate = "";

    //每筆訂單內可能不只包含一個產品, 有可能有兩個以上的產品, 故需要把該訂單內的所有品項都撈出來做顯示
    item.products.forEach(function (item, index) {
      orderProductsTitle += item.title + "<br>";
    });

    //將訂單的日期時間透過函式進行轉換
    orderDate = transferToDateTime(item.createdAt);

    str += combimeOrderListHTML(item, orderProductsTitle, orderDate);
  });
  orderList.innerHTML = str;
};

function combimeOrderListHTML(item, orderProductsTitle, orderDate) {

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
      <a href="#" class="orderOperation" data-id="${item.id}">未處理</a>
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

//訂單列表的監聽事件
orderList.addEventListener("click", function (e) {
  //加入preventDefault(); 取消默認的HTML <a>標籤行為
  e.preventDefault();

  //因為在訂單列表中有兩種按鈕(訂單處理情形與刪除訂單按鈕), 且均有埋設各自的class name和id, 故在此判斷管理者點擊到的是哪一個按鈕
  let orderClass = e.target.getAttribute("class");

  //抓取訂單列表的目標文字, 藉此判斷訂單處理狀態是未處理/已處理 
  let orderOperationText = e.target.textContent;

  //當管理者點擊到訂單處理按鈕時
  if(orderClass === "orderOperation"){
    const orderOperation = document.querySelector(".orderOperation");
    if(orderOperationText === "未處理"){
      orderOperation.textContent = "已處理";
    }else{
      orderOperation.textContent = "未處理";
    }
    alert("此筆訂單狀態已調整");
    return;
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

//刪除單一一張訂單資料
function delOneOrder(orderId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`, {
    headers: {
      'Authorization': token
    }
  })
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

  console.log(orderData.length);

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
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`, {
    headers: {
      'Authorization': token
    }
  })
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