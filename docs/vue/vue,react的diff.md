# vue，react的diff

相同点：vue和react使用虚拟dom（virtual DOM），只会在同一层级去比较，如果有变化直接删除当前虚拟dom节点，插入新的节点(而不是逐层搜索遍历的方式，所以复杂度只有O(n))

## vue的diff过程

当时数据变化时，set方法会调用Dep.notify通知所有的订阅者Watcher，订阅者会调用patch给真实的DOM打补丁

- 第一步：判断两个节点是不是相同的节点，如果不是则删除oldNode，插入新的节点

```
function patch (oldVnode, vnode) {
	if (sameVnode(oldVnode, vnode)) {
		patchVnode(oldVnode, vnode)
	} else {  // 如果不是相同的父节点
		const oEl = oldVnode.el
		let parentEle = api.parentNode(oEl)
		createEle(vnode)
		if (parentEle !== null) {
			api.insertBefore(parentEle, vnode.el, api.nextSibling(oEl)) // 插入新节点
			api.removeChild(parentEle, oldVnode.el)   // 删除旧节点，
			oldVnode = null
		}
	}
	return vnode
}

function sameVnode(oldVnode, vnode){
	return vnode.key === oldVnode.key && vnode.sel === oldVnode.sel
}
```

- 第二步：如果两个节点的el，以及key值相同就会去对比其字子节点

具体过程如下：

  1. 找到真实的DOM称为el

  2. 判断Vnode, oldVnode是否为同一个对象，如果是直接结束

  3. 如果子节点是文本节点且不相等，那么将el的文本节点设置为Vnode的文本节点

  4. 如果不是文本节点，oldVnode有子节点而Vnode没有，则删除el的子节点

  5. 如果oldVnode没有子节点而Vnode有，则将Vnode的子节点真实化之后添加到el

  6. 如果两者都有子节点，则执行updateChildren函数比较子节点

```
patchVnode (oldVnode, vnode) {
  const el = vnode.el = oldVnode.el
  let i, oldCh = oldVnode.children, ch = vnode.children
  if (oldVnode === vnode) return
  // 是文本节点
  if (oldVnode.text !== null && vnode.text !== null && oldVnode.text !== vnode.text) {
    api.setTextContent(el, vnode.text)
  }else { // 不是文本节点
    updateEle(el, vnode, oldVnode)
    if (oldCh && ch && oldCh !== ch) {
      updateChildren(el, oldCh, ch)
    }else if (ch){
      createEle(vnode) //create el's children dom
    }else if (oldCh){
      api.removeChildren(el)
    }
  }
}
```

- 第三步：非文本节点的updateChildren

  1. 取出新旧节点的所有子节点oldCh, newCh，设置两个头尾的变量StartIndex, EndIndex，两两进行比较，如果有比较成功的就进行Vnode位置更新。
  2. 如果设置了key值就会使用key值进行比较，在比较的过程中变量会往中间靠，一旦StartIndex > EndIx 表明oldCh和newCh至少有一个已经遍历完了，就会结束比较。

```
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
  let oldStartIdx = 0
  let newStartIdx = 0
  let oldEndIdx = oldCh.length - 1
  let oldStartVnode = oldCh[0]
  let oldEndVnode = oldCh[oldEndIdx]
  let newEndIdx = newCh.length - 1
  let newStartVnode = newCh[0]
  let newEndVnode = newCh[newEndIdx]
  let oldKeyToIdx, idxInOld, elmToMove, refElm

  // removeOnly is a special flag used only by <transition-group>
  // to ensure removed elements stay in correct relative positions
  // during leaving transitions
  const canMove = !removeOnly

  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx]
    } else if (sameVnode(oldStartVnode, newStartVnode)) { // ** 第一种比较方式 **
      /*前四种情况其实是指定key的时候，判定为同一个VNode，则直接patchVnode即可，分别比较oldCh以及newCh的两头节点2*2=4种情况*/
      patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
      oldStartVnode = oldCh[++oldStartIdx]
      newStartVnode = newCh[++newStartIdx]
    } else if (sameVnode(oldEndVnode, newEndVnode)) { // ** 第二种比较方式 **
      patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
      oldEndVnode = oldCh[--oldEndIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right  ** 第三种比较方式 **
      patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
      oldStartVnode = oldCh[++oldStartIdx]
      newEndVnode = newCh[--newEndIdx]
    } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left  ** 第四种比较方式 **
      patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
      canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
      oldEndVnode = oldCh[--oldEndIdx]
      newStartVnode = newCh[++newStartIdx]
    } else {
      /*
        生成一个key与旧VNode的key对应的哈希表（只有第一次进来undefined的时候会生成，也为后面检测重复的key值做铺垫）
        比如childre是这样的 [{xx: xx, key: 'key0'}, {xx: xx, key: 'key1'}, {xx: xx, key: 'key2'}]  beginIdx = 0   endIdx = 2  
        结果生成{key0: 0, key1: 1, key2: 2}
      */
      if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
      /*如果newStartVnode新的VNode节点存在key并且这个key在oldVnode中能找到则返回这个节点的idxInOld（即第几个节点，下标）*/
      idxInOld = isDef(newStartVnode.key) ? oldKeyToIdx[newStartVnode.key] : null
      if (isUndef(idxInOld)) { // New element
        /*newStartVnode没有key或者是该key没有在老节点中找到则创建一个新的节点*/
        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
        newStartVnode = newCh[++newStartIdx]
      } else {
        /*获取同key的老节点*/
        elmToMove = oldCh[idxInOld]
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && !elmToMove) {
          /*如果elmToMove不存在说明之前已经有新节点放入过这个key的DOM中，提示可能存在重复的key，确保v-for的时候item有唯一的key值*/
          warn(
            'It seems there are duplicate keys that is causing an update error. ' +
            'Make sure each v-for item has a unique key.'
          )
        }
        if (sameVnode(elmToMove, newStartVnode)) {
          /*Github:https://github.com/answershuto*/
          /*如果新VNode与得到的有相同key的节点是同一个VNode则进行patchVnode*/
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue)
          /*因为已经patchVnode进去了，所以将这个老节点赋值undefined，之后如果还有新节点与该节点key相同可以检测出来提示已有重复的key*/
          oldCh[idxInOld] = undefined
          /*当有标识位canMove实可以直接插入oldStartVnode对应的真实DOM节点前面*/
          canMove && nodeOps.insertBefore(parentElm, newStartVnode.elm, oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        } else {
          // same key but different element. treat as new element
          /*当新的VNode与找到的同样key的VNode不是sameVNode的时候（比如说tag不一样或者是有不一样type的input标签），创建一个新的节点*/
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
          newStartVnode = newCh[++newStartIdx]
        }
      }
    }
  }
  if (oldStartIdx > oldEndIdx) {
    /*全部比较完成以后，发现oldStartIdx > oldEndIdx的话，说明老节点已经遍历完了，新节点比老节点多，所以这时候多出来的新节点需要一个一个创建出来加入到真实DOM中*/
    refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
    addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue)
  } else if (newStartIdx > newEndIdx) {
    /*如果全部比较完成以后发现newStartIdx > newEndIdx，则说明新节点已经遍历完了，老节点多余新节点，这个时候需要将多余的老节点从真实DOM中移除*/
    removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx)
  }
}
```
[vue2.0的算法](https://github.com/aooy/blog/issues/2)

