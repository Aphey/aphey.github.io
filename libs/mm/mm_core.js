var old_id=-1;
var old_dirty_id=-1;
var el_content = document.getElementById('content');
var id=0;
var is_running_mathjax=false;

function InitMarked()
{
	var renderer = new Markdown.marked.Renderer();
	var use_emoji=app.GetConfig('Preview', 'Emoji').toLowerCase();
	if( use_emoji=='y' || use_emoji=='1' ) use_emoji=true;
	else use_emoji = false;

	var use_footnote=app.GetConfig('Preview', 'FootNote').toLowerCase();
	if( use_footnote=='y' || use_footnote=='1' ) use_footnote=true;
	else use_footnote = false;

	var lib_path=app.GetConfig('Lib', 'Path');
	
	renderer.listitem = function(text) {
		if (/^ *\[[xX ]\]\s*/.test(text)) {
			text = text
				.replace(/^\s*\[ \] */, '<input type="checkbox" disabled> ')
				.replace(/^\s*\[[xX]\] */, '<input type="checkbox" checked disabled> ');
			return '<li style="list-style: none">' + text + '</li>';
		} else {
			return '<li>' + text + '</li>';
		}
	};

	renderer.code = function(code, language){
		if( use_highlight ){
			//code = code.replace('<', '&lt;').replace('>', '&gt;');
			validLang = !!(language && hljs.getLanguage(language));
			highlighted = validLang ? hljs.highlight(language, code).value : code;
			return '<pre><code class="'+language+'">'+ highlighted + '</code></pre>';
		}
		else
			return '<pre><code>'+code+'</code></pre>';
	};

	Markdown.marked.setOptions({
		renderer: renderer,
		mathjax: use_mathjax,
		emoji: use_emoji,
		emoji_host: 'http://7xj6bw.com1.z0.glb.clouddn.com/',
		footnotes : use_footnote,
		img_callback: function( href ){
       		if (/^res:/.test(href)){
	       		href = href.replace(/^res:/, lib_path).replace(/\\/g, '/');
			}
			return href;
		}
	});
}

function MathjaxDoneCallback()
{
	is_running_mathjax=false;
}

function Preview()
{
	if(!app.IsPreviewVisible() )
		return;

	var doc=app.ActiveDoc;
	if( doc==null )
		return;

	var dirty_id=doc.DirtyId;
	if( doc.id==old_id && dirty_id==old_dirty_id )
		return;

	if( typeof(MathJax)!='undefined' ){
		if( is_running_mathjax )
			return
		is_running_mathjax=true;
	}
	
	var doc=app.ActiveDoc;
	var rs = Markdown.marked( doc.MarkdownText );
	el_content.innerHTML = rs;

	var tocs=$("*[name='toc']");
	if( tocs.length ){
		var toc=generated_toc.generate('content');
		tocs.each(function(){
			$(this).html( toc );
		});
	}
	if( typeof(MathJax)!='undefined' ){
		MathJax.Hub.Queue(
			["Typeset", MathJax.Hub, el_content],
			["PreviewDone", MathjaxDoneCallback]
		);
	}

	var view=app.ActiveMarkdown;
	view.SyncTop();

	old_id=doc.id;
	old_dirty_id=dirty_id;
}

InitMarked();

window.onload = function()
{
	Preview();
	var instant_update=app.GetConfig("Preview", "InstantUpdate").toLowerCase();
	if( instant_update=='' || instant_update=='y' || instant_update=='1' ){
		setInterval(Preview, 1000);
	}
}

window.onscroll = function()
{
	var view=app.ActiveMarkdown;
	if( view==null )
		return;
	if( view.IsFocus() ){
		var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		var windowHeight = document.body.offsetHeight;
		var tags=document.getElementsByTagName('line');
		for( var i=0; i<tags.length; i++){
			var tag = tags[i];
			if (scrollTop <= tag.offsetTop && (tag.offsetHeight + tag.offsetTop) < (scrollTop + windowHeight) ) {
				var id=tag.getAttribute('id');
				id = id.substring(3);
				if( id.length )
					view.ScrollEditor( parseInt(id), false);
				break;
			}
		}
	}
};

window.onmousewheel = function()
{
	window.focus();
}
