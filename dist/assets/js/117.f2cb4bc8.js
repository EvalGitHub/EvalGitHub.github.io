(window.webpackJsonp=window.webpackJsonp||[]).push([[117],{577:function(e,t,a){"use strict";a.r(t);var r=a(28),s=Object(r.a)({},(function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[a("h1",{attrs:{id:"关于meta的几点"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#关于meta的几点"}},[e._v("#")]),e._v(" 关于meta的几点")]),e._v(" "),a("h2",{attrs:{id:"禁止用户缩放屏幕"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#禁止用户缩放屏幕"}},[e._v("#")]),e._v(" 禁止用户缩放屏幕")]),e._v(" "),a("div",{staticClass:"language- extra-class"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[e._v('<meta name="viewport" id="WebViewport" content="initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no">\n')])])]),a("p",[e._v("在做手机H5相关页面的时候，或者某些特定网站我们希望我们的布局视图理想视图是固定大小的，这个时候可以通过上面的meta进行设置。")]),e._v(" "),a("p",[a("strong",[e._v("常见的场景：")]),e._v("\n开发一个pc上的网站，我们能很清楚的很清晰的展现出各种样式，假如网站没有做响应式和自适应的处理，这个时候如果在手机上去浏览这个网站，我们可能会看到网页还是那么大，出现各种滚动条，造成的原因就是设置了禁止缩放，使得布局视图pc与H5相同。这个时候应该允许用户进行缩放，删除index.html中这个meta。")]),e._v(" "),a("h2",{attrs:{id:"指定使用chrmo内核进行渲染"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#指定使用chrmo内核进行渲染"}},[e._v("#")]),e._v(" 指定使用chrmo内核进行渲染")]),e._v(" "),a("p",[e._v("在使用ie浏览器打开网站的时候，会看到控制台出现“正在见兼容视图中运行，因为选中了在兼容性视图中显示Internet站点”；这个时候打开开发者模式你会看到ie的版本可能是ie7，很显然不能兼容现在的前端。")]),e._v(" "),a("p",[a("strong",[e._v("解决方案：")])]),e._v(" "),a("div",{staticClass:"language- extra-class"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[e._v('meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">\n')])])]),a("ul",[a("li",[e._v("如果客户端安装了Chrome Frame，并将其打开，那么在ie上浏览网站的时候，强制浏览器的渲染方式，默认使用chrome进行渲染（在不改变IE的外观情况下使用Chrome内核）。")]),e._v(" "),a("li",[e._v("如果你没有安装chrom Frame，这个时候你在ie浏览器上访问网页，他会默认使用最新版本的ie打开这个页面（ie浏览器在开发者选项中可以选择浏览器版本）。")])]),e._v(" "),a("p",[e._v("参考链接："),a("a",{attrs:{href:"https://www.cnblogs.com/menyiin/p/6527339.html",target:"_blank",rel:"noopener noreferrer"}},[e._v("浅析网页meta标签中X-UA-Compatible属性的使用"),a("OutboundLink")],1)]),e._v(" "),a("h2",{attrs:{id:"指定浏览器的浏览模式"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#指定浏览器的浏览模式"}},[e._v("#")]),e._v(" 指定浏览器的浏览模式")]),e._v(" "),a("div",{staticClass:"language- extra-class"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[e._v('<meta name="renderer" content="webkit|ie-comp|ie-stand">\n')])])]),a("p",[e._v("双核浏览器，就是有两个内核的浏览器。由于IE浏览器在国内的普及率非常高，所以造成了很多网上银行和支付系统只支持IE的Trident内核，其他浏览器访问根本无法进行正常支付和转账等业务。而WebKit内核的非IE浏览器以更高的性能和更好的用户体验拥有了越来越多的用户。于是双核浏览器应运而生，在不用网上交易的一般网站，使用速度快的WebKit内核访问，这就是所谓的“高速模式”；在访问支付宝或者网上银行的时候，使用Trident内核的“兼容模式”来进行业务。一般的双核浏览器拥有IE兼容内核和非IE极速内核两个内核，这样就满足同一用户的不同需求。")]),e._v(" "),a("p",[e._v("参考："),a("a",{attrs:{href:"https://baike.baidu.com/item/%E5%8F%8C%E6%A0%B8%E6%B5%8F%E8%A7%88%E5%99%A8/7126309?fr=aladdin",target:"_blank",rel:"noopener noreferrer"}},[e._v("双核浏览器"),a("OutboundLink")],1)]),e._v(" "),a("p",[e._v("content的取值为"),a("strong",[e._v("webkit，ie-comp，ie-stand")]),e._v("之一，区分大小写，分别代表用webkit内核，IE兼容内核，IE标准内核。")]),e._v(" "),a("ul",[a("li",[e._v("若页面需默认用极速核，增加标签：")])]),e._v(" "),a("div",{staticClass:"language- extra-class"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[e._v('<meta name="renderer" content="webkit"> \n')])])]),a("ul",[a("li",[e._v("若页面需默认用ie兼容内核，增加标签：")])]),e._v(" "),a("div",{staticClass:"language- extra-class"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[e._v('<meta name="renderer" \ncontent="ie-comp"> \n')])])]),a("ul",[a("li",[e._v("若页面需默认用ie标准内核，增加标签：")])]),e._v(" "),a("div",{staticClass:"language- extra-class"},[a("pre",{pre:!0,attrs:{class:"language-text"}},[a("code",[e._v('<meta name="renderer" content="ie-stand">\n')])])])])}),[],!1,null,null,null);t.default=s.exports}}]);