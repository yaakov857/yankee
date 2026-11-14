// Builds shopify\products.csv from ..\..\products.js (the old store's product list).
// Runs on any Windows computer, no installs:  cscript //nologo //E:jscript shopify\tools\make-products-csv.js [image-base-url]
//
// image-base-url (optional): the address prefix of the photos you uploaded to Shopify > Content > Files,
// for example https://cdn.shopify.com/s/files/1/0123/4567/files/
// When given, every path like images/kettle-1.jpg becomes <image-base-url>kettle-1.jpg in the CSV.

function readUtf8(path) {
  var s = new ActiveXObject('ADODB.Stream');
  s.Type = 2; s.Charset = 'utf-8'; s.Open(); s.LoadFromFile(path);
  var t = s.ReadText(); s.Close(); return t;
}
function writeUtf8Bom(path, text) {
  var s = new ActiveXObject('ADODB.Stream');
  s.Type = 2; s.Charset = 'utf-8'; s.Open(); s.WriteText(text);   // ADODB writes a UTF-8 BOM, which Excel needs for Hebrew
  s.SaveToFile(path, 2); s.Close();
}

var fso = new ActiveXObject('Scripting.FileSystemObject');
var here = fso.GetParentFolderName(WScript.ScriptFullName);          // shopify\tools
var shopifyDir = fso.GetParentFolderName(here);                      // shopify
var root = fso.GetParentFolderName(shopifyDir);                      // the old store folder
var imageBase = WScript.Arguments.length ? WScript.Arguments(0) : '';
if (imageBase && imageBase.charAt(imageBase.length - 1) != '/') imageBase += '/';

// products.js sets window.YANKEE_CATEGORIES and window.YANKEE_PRODUCTS
var window = {};
eval(readUtf8(fso.BuildPath(root, 'products.js')));
var cats = window.YANKEE_CATEGORIES || [], products = window.YANKEE_PRODUCTS || [];
function catName(id) { for (var i = 0; i < cats.length; i++) if (cats[i].id == id) return cats[i].name; return id || ''; }

var HEAD = ['Title','URL handle','Description','Vendor','Type','Tags','Published on online store','Status',
  'SKU','Option1 name','Option1 value','Price','Compare-at price','Charge tax','Inventory tracker',
  'Continue selling when out of stock','Weight value (grams)','Weight unit for display','Requires shipping',
  'Fulfillment service','Product image URL','Image position','Image alt text'];

function cell(v) {
  v = (v === null || v === undefined) ? '' : String(v);
  if (/[",\r\n]/.test(v)) v = '"' + v.replace(/"/g, '""') + '"';
  return v;
}
function html(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function row(o) { var a = []; for (var i = 0; i < HEAD.length; i++) a.push(cell(o[HEAD[i]])); return a.join(','); }

var lines = [HEAD.join(',')], count = 0, warnings = [];
for (var i = 0; i < products.length; i++) {
  var p = products[i];
  if (!p || !p.name || !(p.price > 0)) { warnings.push('skipped product #' + (i + 1) + ' (no name or price)'); continue; }
  var handle = String(p.id || ('item-' + (i + 1))).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  var type = catName(p.category);
  var tags = [type]; if (p.oldPrice && p.oldPrice > p.price) tags.push('\u05de\u05d1\u05e6\u05e2');   // the word for "sale", as code points: cscript reads this file as ANSI
  var imgs = p.images || [];
  var first = {
    'Title': p.name, 'URL handle': handle, 'Description': p.description ? '<p>' + html(p.description) + '</p>' : '',
    'Vendor': 'YANKEE', 'Type': type, 'Tags': tags.join(', '), 'Published on online store': 'TRUE', 'Status': 'active',
    'SKU': p.id || '', 'Option1 name': 'Title', 'Option1 value': 'Default Title',
    'Price': Number(p.price).toFixed(2),
    'Compare-at price': (p.oldPrice && p.oldPrice > p.price) ? Number(p.oldPrice).toFixed(2) : '',
    'Charge tax': 'TRUE', 'Inventory tracker': '', 'Continue selling when out of stock': 'deny',
    'Weight value (grams)': Math.round((Number(p.weight) || 0) * 1000), 'Weight unit for display': 'kg',
    'Requires shipping': 'TRUE', 'Fulfillment service': 'manual'
  };
  if (imgs.length && imageBase) {
    first['Product image URL'] = imageBase + imgs[0].replace(/^.*\//, '');
    first['Image position'] = 1; first['Image alt text'] = p.name;
  }
  lines.push(row(first));
  // extra photos: one more row per photo, only handle + image columns
  for (var j = 1; imageBase && j < imgs.length; j++) {
    lines.push(row({'URL handle': handle, 'Product image URL': imageBase + imgs[j].replace(/^.*\//, ''),
      'Image position': j + 1, 'Image alt text': p.name}));
  }
  if (imgs.length && !imageBase) warnings.push(p.id + ': has photos; run again with the Shopify Files address to include them');
  count++;
}
writeUtf8Bom(fso.BuildPath(shopifyDir, 'products.csv'), lines.join('\r\n') + '\r\n');
WScript.Echo('products.csv: ' + count + ' products' + (imageBase ? ' (with photo addresses)' : ''));
for (var w = 0; w < warnings.length; w++) WScript.Echo('note: ' + warnings[w]);
