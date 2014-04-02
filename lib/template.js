/*

html: {
	head: {
		meta(charset="utf-8")
		meta(http-equiv="xxx")
		title: "bxxxxxx"
		link(rel="search" type="application")
		link(rel="socket" ...)
		script: """
			var x = xxx;
			var y = zzz;
		"""
		a(class="xxxx" label="xxxx")
		p: "first name: `name.first`"
		p: "last name: `name.last`"
		

	}
	body: {
		xxx: "dsfasfdaf"
		yyy: '''
			this is a long string `embaded code`
			longlong string
		'''
		each x in `yyyy` {
	
		}
		if `true` {
	
		}
		else `y > 10` {
	
		}
		else {
	
		}
	}
}

// JEML -> JSON -> Template

var compiled = go.template("each name in `names` { name: `name` }")
var doc = compiled({ names: ["hi", "ok"]})
// => "<name>hi</name><name>ok</name>"
*/

// JEML
html(lang="en"): {
	head: "I am head"
	body: {
		p: "I am in body"
		p: { "I am also in body" `xxx` }

		each name in `y` { "ok with `name`" }
		
		if `x > 10` {}
		else `xxx`  {}
		else        {}

		``` var x = true ```
		div(class=`x ? "okk" : "yes"`): "no problem"
	}
}

// -> JSON tag, attribute, content:
[{ 
	tag: "html",
	attribute: { lang: "en" },
	content: [
		{ tag: "head", content: "I am head" }, 
		{ 
			tag: "body", content: [
				{ tag: "p", content: "I am in body" },
				{ tag: "p", content: [
						"I am also in body"
						{ expression: "xxx" }
					] 
				},
				{ 
					each: "name", in: "y", 
				    content: [
				    	"ok with ", { expression: "name" }
					]
				}
			]
		}
	]
}]


mixin name(txt) {
	`txt`
}

`name("okk")`

// =>

function name (txt) {
	
	return xxx;
}

name("okk")


import head "./head.jeml"

import body "http://github.com/xxx/body.jeml"

`body()`

go.template("template string")
yield go.templateFile("address")

// jeml.template()
// yield jeml.templateFile()

mixin xxx {

}

mixin abc {

}





