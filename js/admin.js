//在admin.html檔案中引用config.js檔案後, 即可在此顯示測試看看是否有抓到API的路徑與token
console.log(`api_path=${api_path}, token=${token}`);

const orderList = document.querySelector(".js-orderList");
console.log(orderList);

let orderData = [];

//取得訂單列表的資料
function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`, {
    headers: {
      'Authorization': token
    }
  })
    .then(function (response) {
      orderData = response.data.orders;
      console.log(orderData);
      renderOrderList();

    })
    .catch(function (response) {
      console.log(response);
    })
}

getOrderList();

//將訂單列表的資訊組合成完整HTML, 且在刪除該品項標籤裡, id的後方加入data-id, 令每個產品的刪除按鈕都有各自的id, 以利監聽事件監聽是否有某某產品的"刪除"按鈕已被點擊到了, 即可做出後續處理; 此外因為我們想要做出當點擊到刪除按鈕時, 才做後續處理, 若點擊到該ul裡的其他地方則不執行任何動作, 因此需要在刪除產品的標籤內自行加入一個id
function renderOrderList(){
  let str = "";
  orderData.forEach(function(item, index){
    let orderProductsTitle = "";
    let orderDate = "";

    //每筆訂單內可能不只包含一個產品, 有可能有兩個以上的產品, 故需要把該訂單內的所有品項都撈出來做顯示
    item.products.forEach(function(item, index){
      orderProductsTitle += item.title + "<br>";
    });

    orderDate = transferToDateTime(item.createdAt);

    str += combimeOrderListHTML(item, orderProductsTitle, orderDate);
  });
  orderList.innerHTML = str;
};

function combimeOrderListHTML(item, orderProductsTitle, orderDate){

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
    <td>待呼叫函式處理日期(僅需顯示日期即可)${orderDate}</td>
    <td class="orderStatus">
      <a href="#">未處理</a>
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" data-id="${item.id}" value="刪除">
    </td>
  </tr>`;
  
  return str;
};


//將訂單的毫秒(ms)轉成日期時間(請記得先乘上1000再進行轉換), 參考來源:https://www.delftstack.com/zh-tw/howto/javascript/javascript-convert-timestamp-to-date/
//因訂單創建的日期時間(即訂單API的createdAt屬性)是JavaScript的時間戳, 它是以毫秒為單位, 而如果要把它轉成人類可懂的日期時間,則要將該時間戳乘上1000, 使其成為秒為單位的值, 且將這個時間戳傳給Date物件的建構式, 便可獲得該時間戳的日期時間物件
function transferToDateTime(unixTimestamp){
  let jsTimestamp = new Date(unixTimestamp * 1000);
  //因為getMonth()會回傳當時的月份(0到11), 故需要自行+1 (1到12)
  let orderDate = `${jsTimestamp.getFullYear()}/${jsTimestamp.getMonth()+1}/${jsTimestamp.getDate()} ${jsTimestamp.getHours()}:${jsTimestamp.getMinutes()}:${jsTimestamp.getSeconds()}`;
  //console.log(orderDate);
  return orderDate;
};


// C3.js
let chart = c3.generate({
  bindto: '#chart', // HTML 元素綁定
  data: {
    type: "pie",
    columns: [
      ['Louvre 雙人床架', 1],
      ['Antony 雙人床架', 2],
      ['Anty 雙人床架', 3],
      ['其他', 4],
    ],
    colors: {
      "Louvre 雙人床架": "#DACBFF",
      "Antony 雙人床架": "#9D7FEA",
      "Anty 雙人床架": "#5434A7",
      "其他": "#301E5F",
    }
  },
});