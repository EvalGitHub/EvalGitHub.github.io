# vue的diff过程

相同点：vue和react使用虚拟dom（virtual DOM），只会在同一层级去比较，如果有变化直接删除当前虚拟dom节点，插入新的节点(而不是逐层搜索遍历的方式，所以复杂度只有O(n)，因为react.vue认为那种夸层级移动DOM的操作很少。

## vue的diff过程

当时数据变化时，set方法会调用Dep.notify通知所有的订阅者Watcher，订阅者会调用patch给真实的DOM打补丁

### 第一步：判断两个节点是不是相同的节点，如果不是则删除oldNode，插入新的节点

```
function patch (oldVnode, vnode, hydrating, removeOnly, parentElm, refElm) {
  /*vnode不存在则直接调用销毁钩子*/
  if (isUndef(vnode)) {
    if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
    return
  }

  let isInitialPatch = false
  const insertedVnodeQueue = []

  if (isUndef(oldVnode)) {
    // empty mount (likely as component), create new root element
    /*oldVnode未定义的时候，其实也就是root节点，创建一个新的节点*/
    isInitialPatch = true
    createElm(vnode, insertedVnodeQueue, parentElm, refElm)
  } else {
    /*标记旧的VNode是否有nodeType*/
    const isRealElement = isDef(oldVnode.nodeType)
    if (!isRealElement && sameVnode(oldVnode, vnode)) {
      // patch existing root node
      /*是同一个节点的时候直接修改现有的节点*/
      patchVnode(oldVnode, vnode, insertedVnodeQueue, removeOnly)
    } else {
      if (isRealElement) {
        // mounting to a real element
        // check if this is server-rendered content and if we can perform
        // a successful hydration.
        if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
          /*当旧的VNode是服务端渲染的元素，hydrating记为true*/
          oldVnode.removeAttribute(SSR_ATTR)
          hydrating = true
        }
        if (isTrue(hydrating)) {
          /*需要合并到真实Dom上*/
          if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
            /*调用insert钩子*/
            invokeInsertHook(vnode, insertedVnodeQueue, true)
            return oldVnode
          } else if (process.env.NODE_ENV !== 'production') {
            warn(
              'The client-side rendered virtual DOM tree is not matching ' +
              'server-rendered content. This is likely caused by incorrect ' +
              'HTML markup, for example nesting block-level elements inside ' +
              '<p>, or missing <tbody>. Bailing hydration and performing ' +
              'full client-side render.'
            )
          }
        }
        // either not server-rendered, or hydration failed.
        // create an empty node and replace it
        /*如果不是服务端渲染或者合并到真实Dom失败，则创建一个空的VNode节点替换它*/
        oldVnode = emptyNodeAt(oldVnode)
      }
      // replacing existing element
      /*取代现有元素*/
      const oldElm = oldVnode.elm
      const parentElm = nodeOps.parentNode(oldElm)
      createElm(
        vnode,
        insertedVnodeQueue,
        // extremely rare edge case: do not insert if old element is in a
        // leaving transition. Only happens when combining transition +
        // keep-alive + HOCs. (#4590)
        oldElm._leaveCb ? null : parentElm,
        nodeOps.nextSibling(oldElm)
      )

      if (isDef(vnode.parent)) {
        // component root element replaced.
        // update parent placeholder node element, recursively
        /*组件根节点被替换，遍历更新父节点element*/
        let ancestor = vnode.parent
        while (ancestor) {
          ancestor.elm = vnode.elm
          ancestor = ancestor.parent
        }
        if (isPatchable(vnode)) {
          /*调用create回调*/
          for (let i = 0; i < cbs.create.length; ++i) {
            cbs.create[i](emptyNode, vnode.parent)
          }
        }
      }

      if (isDef(parentElm)) {
        /*移除老节点*/
        removeVnodes(parentElm, [oldVnode], 0, 0)
      } else if (isDef(oldVnode.tag)) {
        /*调用destroy钩子*/
        invokeDestroyHook(oldVnode)
      }
    }
  }

  /*调用insert钩子*/
  invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch)
  return vnode.elm
}
```
```
/*
  判断两个VNode节点是否是同一个节点，需要满足以下条件
  key相同
  tag（当前节点的标签名）相同
  isComment（是否为注释节点）相同
  是否data（当前节点对应的对象，包含了具体的一些数据信息，是一个VNodeData类型，可以参考VNodeData类型中的数据信息）都有定义
  当标签是<input>的时候，type必须相同
*/
function sameVnode (a, b) {
  return (
    a.key === b.key &&
    a.tag === b.tag &&
    a.isComment === b.isComment &&
    isDef(a.data) === isDef(b.data) &&
    sameInputType(a, b)
  )
}

// Some browsers do not support dynamically changing type for <input>
// so they need to be treated as different nodes
/*
  判断当标签是<input>的时候，type是否相同
  某些浏览器不支持动态修改<input>类型，所以他们被视为不同节点
*/
function sameInputType (a, b) {
  if (a.tag !== 'input') return true
  let i
  const typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type
  const typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type
  return typeA === typeB
}
```

### 第二步：如果两个节点的el，以及key值相同就会去对比其子节点

具体过程如下：

  1. 找到真实的DOM称为el

  2. 判断Vnode, oldVnode是否为同一个对象，如果是直接结束

  3. 如果子节点是文本节点且不相等，那么将el的文本节点设置为Vnode的文本节点

  4. 如果不是文本节点，oldVnode有子节点而Vnode没有，则删除el的子节点

  5. 如果oldVnode没有子节点而Vnode有，则将Vnode的子节点真实化之后添加到el

  6. 如果两者都有子节点，则执行updateChildren函数比较子节点

```
 /*patch VNode节点*/
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
  /*两个VNode节点相同则直接返回*/
  if (oldVnode === vnode) {
    return
  }
  // reuse element for static trees.
  // note we only do this if the vnode is cloned -
  // if the new node is not cloned it means the render functions have been
  // reset by the hot-reload-api and we need to do a proper re-render.
  /*
    如果新旧VNode都是静态的，同时它们的key相同（代表同一节点），
    并且新的VNode是clone或者是标记了once（标记v-once属性，只渲染一次），
    那么只需要替换elm以及componentInstance即可。
  */
  if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))) {
    vnode.elm = oldVnode.elm
    vnode.componentInstance = oldVnode.componentInstance
    return
  }
  let i
  const data = vnode.data
  if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
    /*i = data.hook.prepatch，如果存在的话，见"./create-component componentVNodeHooks"。*/
    i(oldVnode, vnode)
  }
  const elm = vnode.elm = oldVnode.elm
  const oldCh = oldVnode.children
  const ch = vnode.children
  if (isDef(data) && isPatchable(vnode)) {
    /*调用update回调以及update钩子*/
    for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
    if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
  }
  /*如果这个VNode节点没有text文本时*/
  if (isUndef(vnode.text)) {
    if (isDef(oldCh) && isDef(ch)) {
      /*新老节点均有children子节点，则对子节点进行diff操作，调用updateChildren*/
      if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)
    } else if (isDef(ch)) {
      /*如果老节点没有子节点而新节点存在子节点，先清空elm的文本内容，然后为当前节点加入子节点*/
      if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
      addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)
    } else if (isDef(oldCh)) {
      /*当新节点没有子节点而老节点有子节点的时候，则移除所有ele的子节点*/
      removeVnodes(elm, oldCh, 0, oldCh.length - 1)
    } else if (isDef(oldVnode.text)) {
      /*当新老节点都无子节点的时候，只是文本的替换，因为这个逻辑中新节点text不存在，所以直接去除ele的文本*/
      nodeOps.setTextContent(elm, '')
    }
  } else if (oldVnode.text !== vnode.text) {
    /*当新老节点text不一样时，直接替换这段文本*/
    nodeOps.setTextContent(elm, vnode.text)
  }
  /*调用postpatch钩子*/
  if (isDef(data)) {
    if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
  }
}
```

### 第三步：非文本节点的updateChildren

  1. 取出新旧节点的所有子节点oldCh, newCh，设置两个头尾的变量StartIndex, EndIndex，两两进行比较，如果有比较成功的就进行Vnode位置更新。
  2. 如果设置了key值就会使用key值进行比较，在比较的过程中变量会往中间靠，一旦StartIndex > EndIx 表明oldCh和newCh至少有一个已经遍历完了，就会结束比较进行节点的删除或者直接添加。

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
[代码来源learVue](https://github.com/answershuto/learnVue/blob/master/docs/VirtualDOM%E4%B8%8Ediff(Vue%E5%AE%9E%E7%8E%B0).MarkDown)

## 相比react diff的不同

Vue diff使用的双向链表形式边对比，边更新DOM（starIndex, endIndex的使用）

react 使用diff队列保存需要更新的DOM（从头到尾一一比较）得到patch树，在统一的批量更新DOM。

[vue2.0的diff算法](https://github.com/aooy/blog/issues/2)，[vNode](https://github.com/answershuto/learnVue/blob/master/docs/VirtualDOM%E4%B8%8Ediff(Vue%E5%AE%9E%E7%8E%B0).MarkDown)
