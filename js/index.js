//在本檔案中引用config.js檔案後, 即可測試看看是否有抓到API的路徑與token
const productList = document.querySelector(".productWrap");
let productData = [];


function init(){
  getProductList();
}

//透過axios取得產品列表, 並且將產品卡片渲染在畫面上
function getProductList(){
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`)
.then(function(response){
  productData = response.data.products;
  console.log(productData);
  let str ="";
  productData.forEach(function(item, index){
    str +=`<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}" alt="Antony 雙人">
    <a href="#" id="addCardButton">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${item.origin_price}(這裡的js請不要寫成innterHTML, 前方多寫一個小寫t, 因為這樣VScode也不會報錯, 請留意; 在此先將金額直接寫死; 請記得到時候顯示出來時要在千分位加上逗號)</del>
    <p class="nowPrice">NT$${item.price}</p>
  </li>`;
  });
  productList.innerHTML = str;
})
.catch(function(response){
  console.log(response);
})
}

init();









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