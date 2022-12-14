//在index.html檔案中引用config.js檔案後, 即可在此顯示測試看看是否有抓到API的路徑與token
//console.log(`api_path=${api_path}, token=${token}`);

//API所需的headers設為一個物件, 以利直接帶入即可使用
const headers = {
  'Authorization': token
};

const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
const cartDelAll = document.querySelector(".discardAllBtn");
const cartTotalPrice = document.querySelector(".js-total");
const orderSubmitBtn = document.querySelector(".orderInfo-btn");
const orderInfos = document.querySelectorAll(".orderInfo-message");


 //綁定前台預訂表單各欄位的DOM元素
 const customerName = document.querySelector("#customerName");
 const customerPhone = document.querySelector("#customerPhone");
 const customerEmail = document.querySelector("#customerEmail");
 const customerAddress = document.querySelector("#customerAddress");
 const customerTradeWay = document.querySelector("#tradeWay");

let productData = [];
let cartData = [];

function init() {
  getProductList();
  getCartList();
}
init();

//取得產品列表的資料
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
      productData = response.data.products;
      //console.log(productData);
      renderProductList();

    })
    .catch(function (response) {
      console.log(response);
    })
}

//渲染產品列表到畫面上
function renderProductList() {
  //這個str記得要放在forEach外面, 這樣子要渲染資料時才能找到這個str變數
  let str = "";
  productData.forEach(function (item, index) {
    //將產品原價改成具有千分位號方式顯示
    let thousandProductOriginalPrice = changeToThousandNum(item.origin_price);
    //將產品價格改成具有千分位號方式顯示
    let thousandProductPrice = changeToThousandNum(item.price);
    str += combimeProductListHTML(item, thousandProductOriginalPrice, thousandProductPrice);
  });
  productList.innerHTML = str;
};

//將金額轉成具有千分位號的形式, 從物件內取出的金額是數字, 故需要先轉成字串(.toString())後, 才能轉換
function changeToThousandNum(price){
  //這個\B的意思代表並非頭尾邊界, 而是數字之間的邊界, 例如數字:123, 則\B代表的是1和2之間, 2和3之間
  //這個(?<!)代表的意思是在前方沒有..., (?<!\.\d*)代表在前方沒有小數點, 也沒有任何數字(*代表匹配前一字元0至多次, d*代表前一字元為數字0至多次的意思)
  //這個(?=)代表的意思是在後方必須要是..., (?=(\d{3})+代表在後方必須要是三個數字一組的值, 也就是12345, 則符合此條件的是1和2之間的間界, 因為後方有一組234(三個數字一組的值), 以及2和3之間的間界, 因為後方有一組345(三個數字一組的值), 而最後的那個+號代表"至少要有一組或一組以上"具有這種三個數字一組的值
  //(?!\d)代表的意思是後方不可以是數字, 而/g代表查找所有可能的匹配結果, 如果不加/g就只會匹配一個結果就結束
  let tempStr = price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  return tempStr;
  
};

//將產品列表的資訊組合成完整HTML, 且在加入購物車的<a>標籤裡, id的後方加入data-id, 令每個產品的加入購物車按鈕都有各自的id, 以利監聽事件監聽是否有某某產品的"加入購物車"按鈕已被點擊到了, 即可做出後續處理; 此外因為我們想要做出當點擊到加入購物車按鈕時, 才做後續處理, 若點擊到該ul裡的其他地方則不執行任何動作, 因此需要在加入購物車的<a>標籤內自行加入一個class name; 且id照理來說只能用一次, 因此這裡是設計師寫錯了
function combimeProductListHTML(item, thousandProductOriginalPrice, thousandProductPrice) {
  let str = `<li class="productCard">
  <h4 class="productType">新品</h4>
  <img src="${item.images}" alt="Antony 雙人">
  <a href="#" class="js-addCart" id="addCardButton" data-id="${item.id}">加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${thousandProductOriginalPrice}</del>
  <p class="nowPrice">NT$${thousandProductPrice}</p>
</li>`;
  return str;
}

//針對下拉式選單進行監聽
productSelect.addEventListener("change", function (e) {
  const category = e.target.value;
  //console.log(category);
  if (category === "全部") {
    renderProductList();
    return;
  }
  //這個str記得要放在forEach外面, 這樣子要渲染資料時才能找到這個str變數
  let str = "";
  productData.forEach(function (item, index) {
    //item抓出產品列表的8筆資料後, 逐一跟監聽事件所選中的"category的值"做比較, 有符合者才走入if判斷式
    if (item.category === category) {
      //將產品原價改成具有千分位號方式顯示
      let thousandProductOriginalPrice = changeToThousandNum(item.origin_price);
      //將產品價格改成具有千分位號方式顯示
      let thousandProductPrice = changeToThousandNum(item.price);
      
      str += combimeProductListHTML(item, thousandProductOriginalPrice, thousandProductPrice);
    }
  });
  productList.innerHTML = str;
});

//當使用者對產品按下加入購物車時
productList.addEventListener("click", function (e) {
  //加入preventDefault(); 取消默認的HTML <a>標籤行為
  e.preventDefault();

  //取得在產品列表內ul自訂的class name, 如果並非加入購物車<a>標籤內的class name, 則不做任何反應
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "js-addCart") {
    //alert("如果您欲將產品加入購物車, 請點擊'加入購物車'按鈕");
    return;
  }
  //如果程式能通過上方, 執行到這裡, 那就代表使用者有正確點擊到加入購物車<a>標籤, 故取出產品id稍後使用
  let productId = e.target.getAttribute("data-id");
  //console.log(productId);

  //當使用者對產品按下加入購物車之後, 先檢查購物車內該品項的數量後, 再加1ㄋ
  let checkProductNum = 1;
  cartData.forEach(function (item, index) {
    //如果使用者對某產品按下加入購物車按鈕, 則如果購物車內產品id和該被點擊加入的產品的id相符, 代表購物車內已有該產品, 故把該數量取出來後加1; 否則就維持預設數量1, 稍後把產品id和數量傳給API進行資料登錄
    if (item.product.id === productId) {
      checkProductNum = item.quantity += 1;
    }

  });
  alert("已將產品加入購物車");
  //console.log(`checkProductNum=${checkProductNum}`);
  postCartList(productId, checkProductNum);
});

//取得購物車清單的資料
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {

      //將API回傳的購物車總金額顯示在畫面上
      cartTotalPrice.textContent = response.data.finalTotal;

      cartData = response.data.carts;
      //console.log(cartData);
      renderCartList();
    })
    .catch(function (response) {
      console.log(response);
    })

};

//渲染購物車列表到畫面上
function renderCartList() {
  let str = "";
  cartData.forEach(function (item, index) {
    let thousandUnitPrice = changeToThousandNum(item.product.price);
    let thousandTotalPrice = changeToThousandNum(item.product.price * item.quantity);

    str += combimeCartListHTML(item, thousandUnitPrice, thousandTotalPrice);
  });
  cartList.innerHTML = str;
};

//將購物車的資訊組合成完整HTML
function combimeCartListHTML(item, thousandUnitPrice, thousandTotalPrice) {
  let str =
    `<tr>
    <td>
      <div class="cardItem-title">
        <img src="${item.product.images}" alt="">
        <p>${item.product.title}</p>
      </div>
    </td>
    <td>NT$${thousandUnitPrice}</td>
    <td>${item.quantity}</td>
    <td>NT$${thousandTotalPrice}</td>
    <td class="discardBtn">
      <a href="#" class="material-icons" data-id="${item.id}" data-productTitle="${item.product.title}">
        clear
      </a>
    </td>
  </tr>`;
  return str;
};

//增加產品到購物車清單內
function postCartList(addProductId, addQuantity) {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    data: {
      "productId": addProductId,
      "quantity": addQuantity
    }
  })
    .then(function (response) {
      //將API回傳的購物車總金額顯示在畫面上, 且將該總金額轉成千分位號後進行顯示
      cartTotalPrice.textContent = changeToThousandNum(response.data.finalTotal);
      cartData = response.data.carts;
      //console.log(cartData);
      renderCartList();
    })
    .catch(function (response) {
      console.log(response);
    })

};

//當購物車內單一品項的刪除按鈕被點擊時
cartList.addEventListener("click", function (e) {
  //加入preventDefault(); 取消默認的HTML <a>標籤行為
  e.preventDefault();
  //抓取自行埋設在刪除按鈕上的id
  const cartId = e.target.getAttribute("data-id");
  //抓取自行埋設在刪除按鈕上的產品名稱, 用於當刪除該項目時可顯示其產品名稱
  const cartProductTitle = e.target.getAttribute("data-productTitle");
  //如果使用者點到ul的他處則cartId的值會為null, 故可跳出提示告知您點擊到他處了
  if (cartId === null) {
    //alert("如果要刪除該品項, 請點擊右方的X圖示");
    return;
  }
  //console.log(`您點到的是刪除按鈕沒錯, 產品名稱:${cartProductTitle}`);
  delCartItem(cartId, cartProductTitle);

});

//刪除購物車清單內單一品項的資料
function delCartItem(wantDelCartItemId, wantDelCartItemTitle) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${wantDelCartItemId}`)
    .then(function (response) {
      //將API回傳的購物車總金額顯示在畫面上, 且將該總金額轉成千分位號後進行顯示
      cartTotalPrice.textContent = changeToThousandNum(response.data.finalTotal);

      //當刪除單一品項完畢後, 在此要接收購物車的新資料, 這樣才能及時將cartData變數內的資料做更新, 然後呼叫渲染購物車列表函式時, 才會立刻顯示最新的購物車列表內容在畫面上
      cartData = response.data.carts;
      //console.log(cartData);
      alert(`您已刪除購物車內的"${wantDelCartItemTitle}"品項了`);
      renderCartList();
    })
    .catch(function (response) {
      console.log(response);
    })

};

//當購物車的刪除所有品項按鈕被點擊時
cartDelAll.addEventListener("click", function (e) {
  //加入preventDefault(); 取消默認的HTML <a>標籤行為
  e.preventDefault();

  delCartAllItem();
});

//刪除購物車清單所有資料
function delCartAllItem() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      //將API回傳的購物車總金額顯示在畫面上
      cartTotalPrice.textContent = response.data.finalTotal;

      //當刪除所有品項完畢後, 在此要接收購物車的新資料, 這樣才能及時將cartData變數內的資料做更新, 然後呼叫渲染購物車列表函式時, 才會立刻顯示最新的購物車列表內容在畫面上
      cartData = response.data.carts;
      //console.log(cartData);
      alert(`您已清空購物車了`);
      renderCartList();
    })
    .catch(function (response) {
      alert(`您已清空購物車了, 請勿再次點擊`);
      console.log(response);
    })
};

//當使用者按下送出預定資料按鈕時
orderSubmitBtn.addEventListener("click", function(e){
  //加入preventDefault(); 取消默認的HTML標籤行為
  e.preventDefault();

  //依據最終關卡任務的"最終關卡流程圖_DOM 與 API 介接"所述, 需先確認購物車內是否有品項, 如有才能繼續走送出訂單的流程
  if(cartData.length === 0){
    alert("請先將商品加入購物車, 才能送出訂單");
    return;
  }

  let user = {};

  //將使用者填的訂單資料組合成一個user物件
  user.name = customerName.value;
  user.tel = customerPhone.value;
  user.email = customerEmail.value;
  user.address = customerAddress.value;
  user.payment = customerTradeWay.value;

  //將表單各欄位後方預設的"必填"二字先清除,　稍後判斷欄位內容是否正確, 如不正確則填上驗證錯誤的對應訊息
  orderInfos.forEach(function(item, index){
    item.textContent = "";
  });

  //檢查欄位內容是否正確並回傳結果
  if(checkForm(user)===false){
    alert("請將訂單內容依格式規範填寫完整後, 再次送出訂單");
    return;
  }

  //因為增加一筆訂單的API, 其需包含一個名稱為data的物件, 該物件內需包含使用者填寫的訂單資訊, 再呼叫函式傳送過去給API使用
  let data = {
    user
  };

  //呼叫增加一筆訂單的API函式
  postOrder(data);
});


function checkForm(user){
 
  const constraints = {
    name: {
      presence: {
        allowEmpty: false,
        message: "不可為空白"
      }
    },
    tel: {
      presence: {
        allowEmpty: false,
        message: "不可為空白"
      },
      numericality: {
        onlyInteger: true,
        message: "僅接受數字"
      },
      length: {
        is: 10,
        message: "請輸入10位數字的號碼"
      }
    },
    email: {
      presence: {
        allowEmpty: false,
        message: "不可為空白"
      },
      email: {
        message: "並非有效的Email格式"
      }
    },
    address: {
      presence: {
        allowEmpty: false,
        message: "不可為空白"
      }
    }
  };

  let validateErrors = validate(user, constraints);

  //如果有錯誤訊息, 則走入if判斷式內顯示內容
  if(validateErrors){
    //console.log(`validateErrors如下`);
    //console.log(validateErrors);

    //將驗證後的結果, 對照欄位名稱並印出對應的錯誤訊息
    Object.keys(validateErrors).forEach(function(keys){
      document.querySelector(`.${keys}`).textContent = validateErrors[keys];
    });
    return false;
  }else{
    //console.log("表單資料全數通過驗證");
    return true;
  }
};

//增加一筆訂單, API網址後需包含一個data物件, 該物件內需包含使用者填寫的訂單資訊
function postOrder(data) {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`, 
  {
    data
  }).then(function (response) {
      //console.log(response.data);
      alert("加入訂單成功");
      
      //送出訂單後, 重新取得購物車API的資料, 發現購物車已經清空了
      getCartList();

      //將訂單輸入內容清空
      clearOrderInfo();
    })
    .catch(function (response) {
      console.log(response);
    })

};

//清空使用者在畫面上輸入的各項訂單資訊
function clearOrderInfo(){
  customerName.value = "";
  customerPhone.value = "";
  customerEmail.value = "";
  customerAddress.value = "";
  //預設的內容是ATM
  customerTradeWay.value = "ATM";
};