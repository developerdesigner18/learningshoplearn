if(!window.jQuery)
{
  var script = document.createElement('script');
  script.type = "text/javascript";
  script.src = "https://code.jquery.com/jquery-3.5.1.min.js";
  document.getElementsByTagName('head')[0].appendChild(script);
  setTimeout(function(){ 
    window.addEventListener('load', (event) => {
      load();
    });
  },1000);
}else{
  window.addEventListener('load', (event) => {
    load();
  });
}


function load(){

  $('[name="checkout"]').before('<div class="auto_discount" style="display: block;padding: 0 20px;"></div>');

  if(window.location.pathname == '/cart' && typeof Shopify.shop !== "undefined" && typeof window.ShopifyAnalytics.meta.page.customerId !== "undefined"){
    get_discount();


    var handler = function(){
      $('form[action="/cart"] table').unbind('DOMSubtreeModified', handler);
      setTimeout(function(){
        get_discount();
        $('form[action="/cart"] table').bind('DOMSubtreeModified', handler);
      },1000)
    }

    $('form[action="/cart"] table').bind('DOMSubtreeModified', handler);
  }else{
    $(".auto_discount").html('<label style="color: green;">Please <a href="/account/login">login</a>  to get new discount offers.</label>');
  }

}

function get_discount(){
  var shop = Shopify.shop;
  var customerId = window.ShopifyAnalytics.meta.page.customerId;
  $.ajax({
    url : "/cart.js",
    type : "get",
    dataType : 'json',
    success : function(cart){
      var currency = cart.currency;
      $.ajax({
        url : "https://4221-106-201-231-192.ngrok.io/basic-shopify-api/storepoint_function.php?shop="+shop,
        type : "POST",
        data: {apply_discount: true, cart : cart, customerId: customerId},
        dataType: 'json',
        beforeSend : function(){
          $(".auto_discount").html('<label style="color: green;">Loading new offers...</label>');
        },
        success: function(data){
          if(data.status){
            var discounts = data.response;
            var html = "";
            if(data.response.length>0){
              count = data.response.length;

              html += '<label style="color: green;">Congratulations! You got '+count+' offers.</label>';
              $.each(discounts,function(key,discount){
                discount_amount = Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(discount.amount)

                html += '<div style="display: inline-flex;align-items: center;margin: 5px 10px;">';
                html += '<input type="radio" name="discount" value="'+discount.code+'" style="margin-right: 5px;"><label>Flat '+discount_amount+'</label>';
                html += '</div>';
              });

              $(".auto_discount").html(html);
            }

          }else{
            
            html = '<label style="color: red;">Sorry, we do not have any offer for you. <br> <a href="#" target="_blank">Read more</a> for redeem points</label>';
            html += '<input type="hidden" name="discount" value="">';
            
            $(".auto_discount").html(html);
          }
        },
        error: function(data){
          console.log(data);
          alert('Something Went Wrong.');
        }
      });
    },
    error: function(data){
      console.log(data);
      alert('Something Went Wrong.');
    }
  });
}
