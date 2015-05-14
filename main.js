'use strict';
{
    let util={
        apply:function(target,attr){
            for(let i in attr){
                if(util.isObject(attr[i])&&target[i]&&typeof target[i]==='object'){
                    if(attr[i].__replace){
                        delete attr[i].__replace;
                        target[i]=attr[i];
                    }
                    else{
                        util.apply(target[i],attr[i]);
                    }
                }
                else{
                    target[i]=attr[i];
                }
            }
            return target;
        },
        fill:function(target,attr){
            for(let i in attr){
                if(util.isObject(attr[i])&&target[i]&&typeof target[i]==='object'){
                    if(!attr[i].__replace){
                        util.fill(target[i],attr[i]);
                    }
                }
                else if(!target.hasOwnProperty(i)){
                    target[i]=attr[i];
                }
            }
            return target;
        },
        merge:function(){
            let item={};
            for(let i=0;i<arguments.length;i++){
                util.fill(item,arguments[i]);
            }
            return item;
        },
        copy:function(obj){
            let copy={};
            for(let i in obj){
                if(util.isObject(obj[i])){
                    copy[i]=util.copy(obj[i]);
                }
                else if(Array.isArray(obj[i])){
                    copy[i]=obj[i].slice(0);
                }
                else{
                    copy[i]=obj[i];
                }
            }
            return copy;
        },

		isDiv:function(obj){
			return Object.prototype.toString.call(obj)==='[object HTMLDivElement]';
		},
		isNode:function(obj){
            let str=Object.prototype.toString.call(obj);
            if(str.indexOf('[object HTML')!==0) return false;
            if(str.lastIndexOf('Element]')!==str.length-8) return false;
            if(!obj.nodeType) return false;
			return true;
		},
		isObject:function(obj){
			return Object.prototype.toString.call(obj)==='[object Object]';
		},
    };
    let listener={
        newProj:function(e){
            if(e.keyCode===13){
                this.contentEditable=false;
            }
        }
    };
    let current={
        id:0
    };
    let node=function(){
        let tagName='div',attrs=[];
        let node1,node2,func;
        let innerHTML=false;
        for(let i=0;i<arguments.length;i++){
            if(typeof arguments[i]==='string'){
                if(innerHTML){
                    attrs.push({innerHTML:arguments[i]});
                }
                else{
                    innerHTML=true;
                    let arg={};
                    let props=arguments[i].split('.');
                    let first=props.shift();
                    if(first){
                        first=first.split('#');
                        if(first[0]){
                            tagName=first[0];
                        }
                        if(first[1]){
                            arg.id=first[1];
                        }
                    }
                    for(let prop of props){
                        prop=prop.split('#');
                        if(prop[0]){
                            if(!arg.className){
                                arg.className=prop[0];
                            }
                            else{
                                arg.className+=' '+prop[0];
                            }
                        }
                        if(prop[1]){
                            arg.id=prop[1];
                        }
                    }
                    attrs.push(arg);
                }
            }
            else if(util.isNode(arguments[i])){
                if(node1){
                    node2=arguments[i];
                }
                else{
                    node1=arguments[i];
                }
            }
            else if(util.isObject(arguments[i])){
                attrs.push(arguments[i]);
            }
            else if(typeof arguments[i]==='function'){
                func=arguments[i];
            }
        }
        let node=document.createElement(tagName);
        for(let attr of attrs){
            util.apply(node,attr);
        }
        if(func){
            node.addEventListener('click',func);
        }
        if(node1){
            if(node2){
                if(node1===node2.parentNode){
                    node1.insertBefore(node,node2);
                }
                else if(node2===node1.parentNode){
                    node2.insertBefore(node,node1);
                }
            }
            else{
                node1.appendChild(node);
            }
        }
        return node;
    };
    let nodes={
        toolbar:node('#toolbar.block'),
        main:node('#main.block'),
        statusbar:node('#statusbar.block'),
    };
    nodes.sidebar1=node('.sidebar.left',nodes.main);
    nodes.sidebar2=node('.sidebar.right',nodes.main);
    nodes.content=node('#content',nodes.main);

    node(nodes.sidebar1,'.add','+',function(){
        let item=node(nodes.sidebar1,this,'.single','<div class="caption">新项目</div>');
        item.firstChild.contentEditable=true;
        item.firstChild.addEventListener('keydown',listener.newProj);
    });
    window.addEventListener('load',function(){
        document.body.appendChild(nodes.toolbar);
        document.body.appendChild(nodes.main);
        document.body.appendChild(nodes.statusbar);
    });
    {
        let dbname='projects';
        let request=window.indexedDB.open('note_20150514',1);
        request.onupgradeneeded=function(e){
            let idb=e.target.result;
            if(idb.objectStoreNames.contains(dbname)){
                idb.deleteObjectStore(dbname);
            }
            idb.createObjectStore(dbname,{keyPath: 'id'});
        };
        request.onsuccess=function(e){
            let idb=e.target.result;
            let store=idb.transaction(dbname).objectStore(dbname);
            // store.get(database.id).onsuccess=function(e){
            //     if(!e.target.result){
            //         store.add({id:database.id}).onsuccess=finish;
            //     }
            //     else{
            //         database.config=e.target.result.config||database.config;
            //         database.content=e.target.result.content||database.content;
            //         finish();
            //     }
            // };
        };
    }
}
