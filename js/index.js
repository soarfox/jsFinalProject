//在本檔案中引用config.js檔案後, 即可測試看看是否有抓到API的路徑與token
const productList = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
let productData = [];
let cartData = [];

function init() {
  getProductList();
  getCartList();
}
init();

//取得API內產品列表的資料
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
    .then(function (response) {
      productData = response.data.products;
      console.log(productData);
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
    str += combimeProductListHTML(item);
  });
  productList.innerHTML = str;
};

//將產品列表的資訊組合成完整HTML, 且在加入購物車的<a>標籤裡, id的後方加入data-id, 令每個產品的加入購物車按鈕都有各自的id, 以利監聽事件監聽是否有某某產品的"加入購物車"已按鈕被點擊到了, 即可做出後續處理; 此外因為我們想要做出當點擊到加入購物車按鈕時, 才做後續處理, 若點擊到該ul裡的其他地方則不執行任何動作, 因此需要在加入購物車的<a>標籤內自行加入一個class name; 且id照理來說只能用一次, 因此這裡是設計師寫錯了
function combimeProductListHTML(item){
  let str =`<li class="productCard">
  <h4 class="productType">新品</h4>
  <img src="${item.images}" alt="Antony 雙人">
  <a href="#" class="js-addCart" id="addCardButton" data-id="${item.id}">加入購物車</a>
  <h3>${item.title}</h3>
  <del class="originPrice">NT$${item.origin_price}(這裡的js請不要寫成innterHTML, 前方多寫一個小寫t, 因為這樣VScode也不會報錯, 請留意; 在此先將金額直接寫死; 請記得到時候顯示出來時要在千分位加上逗號)</del>
  <p class="nowPrice">NT$${item.price}</p>
</li>`;
  return str;
}

//針對下拉式選單進行監聽
productSelect.addEventListener("change", function (e) {
  const category = e.target.value;
  console.log(category);
  if(category == "全部"){
    renderProductList();
    return;
  }
  //這個str記得要放在forEach外面, 這樣子要渲染資料時才能找到這個str變數
  let str = "";
  productData.forEach(function(item,index){
    //item抓出產品列表的8筆資料後, 逐一跟監聽事件所選中的資料做比較, 有相同者才會進入if判斷式內進行HTML字串的串接
    if(item.category == category){
      str += combimeProductListHTML(item);
    }
  });
  productList.innerHTML = str;
});

productList.addEventListener("click",function(e){
    //加入preventDefault(); 使"加入購物車"的<a>標籤效果失效, 避免每次點擊加入購物車後, 一直讓網頁跳轉到最上方
    e.preventDefault();
    
    //取得在產品列表內ul自訂的class name, 如果並非加入購物車<a>標籤內的class name, 則不做任何反應
    let addCartClass = e.target.getAttribute("class");
    if(addCartClass!=="js-addCart"){
      //alert("不要亂點唷");
      return;
    }
    //如果程式能通過上方, 執行到這裡, 那就代表使用者有正確點擊到加入購物車<a>標籤, 故取出產品id稍後使用
    let productId = e.target.getAttribute("data-id");
    console.log(productId);
});

//取得API內購物車清單的資料
function getCartList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
    .then(function (response) {
      cartData = response.data.carts;
      console.log(cartData);
      renderCartList();
    })
    .catch(function (response) {
      console.log(response);
    })

};

//渲染購物車列表到畫面上
function renderCartList(){
  let str = "";
  cartData.forEach(function(item, index){
    str += combimeCartListHTML(item);
  });
  cartList.innerHTML = str;
};

//將購物車的資訊組合成完整HTML
function combimeCartListHTML(item){
  let singleItemTotalPrice = item.quantity * item.product.price;
  let str =
  `<tr>
    <td>
      <div class="cardItem-title">
        <img src="${item.product.images}" alt="">
        <p>${item.product.title}</p>
      </div>
    </td>
    <td>NT$${item.product.price}</td>
    <td>${item.quantity}</td>
    <td>NT$${singleItemTotalPrice}</td>
    <td class="discardBtn">
      <a href="#" class="material-icons">
        clear
      </a>
    </td>
  </tr>`;
  return str;
};











/* 

//產品 DOM
const productList = document.querySelector('.productList');
const cartList = document.querySelector('.cartList');
const productCategory = document.querySelector('.productCategory');
let productData = [];
let cartData = [];

function init(){
  getProductList();
  getCartList();
}
init();
// 取得產品列表
function getProductList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
      productData = response.data.products;
      renderProductList();
    })
}

function renderProductList(){
  let str = "";
  productData.forEach(function(item){
    str+=`<li>${item.title}<input value="加入購物車" data-id="${item.id}" class="js-addCart" type="button"></li>`
  })
  productList.innerHTML = str;
}

productCategory.addEventListener('change',function(e){
  let category = e.target.value;
  if(category=="全部"){
    renderProductList();
    return;
  }
  let str = "";
  productData.forEach(function (item) {
    if (item.category == category ){
      str += `<li>${item.title}<input value="加入購物車" data-id="${item.id}" class="js-addCart" type="button"></li>`;
    }
  })
  productList.innerHTML = str;
  
})

productList.addEventListener('click',function(e){
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !=="js-addCart"){
    return;
  }
  let productId = e.target.getAttribute("data-id");
  addCartItem(productId);
})

// 取得購物車列表
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${ api_path }/carts`).
    then(function (response) {
      cartData = response.data.carts;
      
      let str = "";
      cartData.forEach(function(item){
        str += `<li>${item.product.title}，${item.quantity}個 <input type="button" data-id="${item.id}" value="移除購物車"></li>`
      })
      cartList.innerHTML = str;
    })
}

// 加入購物車
function addCartItem(id){
  let numCheck = 1;
  cartData.forEach(function(item){
    if (item.product.id === id) {
      numCheck = item.quantity += 1;
    }
  })
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,{
    data: {
      "productId": id,
      "quantity": numCheck
    }
  }).
    then(function (response) {
      alert("加入購物車成功");
      getCartList();
    })

}

// 刪除購物車內特定產品
cartList.addEventListener('click', function (e) {
  let cartId = e.target.getAttribute('data-id');
  if (cartId == null) {
    return;
  }
  deleteCartItem(cartId);

})
function deleteCartItem(cartId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`)
  .then(function (response) {
    alert("刪除單筆購物車成功！");
    getCartList();
  })
  
}

// 清除購物車內全部產品
const deleteAllCartBtn = document.querySelector('.deleteAllCartBtn');
function deleteAllCartList(){
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`)
  .then(function (response) {
      alert("刪除全部購物車成功！");
      getCartList();
  })
  .catch(function (response) {
    alert("購物車已清空，請勿重複點擊！")
  })
}
deleteAllCartBtn.addEventListener('click',function(e){
  deleteAllCartList();
})



// 送出購買訂單
const sendOrder = document.querySelector('.sendOrder');
sendOrder.addEventListener('click',function(e){
  let carthLength = document.querySelectorAll(".cartList li").length;
  if (carthLength==0){
    alert("請加入至少一個購物車品項！");
    return;
  }
  let orderName = document.querySelector('.orderName').value;
  let orderTel = document.querySelector('.orderTel').value;
  let orderEmail = document.querySelector('.orderEmail').value;
  let orderAddress = document.querySelector('.orderAddress').value;
  let orderPayment = document.querySelector('.orderPayment').value;
  if (orderName == "" || orderTel == "" || orderEmail == "" || orderAddress==""){
    alert("請輸入訂單資訊！");
    return;
  }
  let data = {
    name: orderName,
    tel: orderTel,
    Email: orderEmail,
    address: orderAddress,
    payment: orderPayment
  }
  createOrder(data);
})
function createOrder(item){
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": item.name,
          "tel": item.tel,
          "email": item.Email,
          "address": item.address,
          "payment": item.payment
        }
      }
    }
  ).then(function (response) {
      alert("訂單建立成功!")
      getCartList();
    })
}
 */