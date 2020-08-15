'use strict';

import styles from '../style/termStyle.less';
import treeStyles from '../style/editableTreeStyle.less';
import React, { useState } from 'react';

import { List, Popconfirm, Modal, message } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  PlusCircleOutlined,
  CaretRightOutlined,
  CaretDownOutlined,
} from '@ant-design/icons';

const noop = () => {};

const defaultRequest = () =>
  new Promise((resolve) =>
    resolve({
      status: { code: -1 },
    }),
  );

const requestSuccess = (result) => {
  try {
    const {
      status: { code },
    } = result;
    return code === 0;
  } catch (e) {
    return false;
  }
};

// 这个组件稍微复杂一些，用 class，比好多个 hook 更好维护一些。
export default class EditableTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disableHoverMove: false, // 正在编辑时，不响应 hover 事件
      curHoverNode: null, // hover
      curFocusedNode: null, // 当前 focus（正在编辑）的 node
      adding: false, // 是否正在新增
      addingChildrenForNode: null, // 需要新增子分类的节点
      addingTermName: '', // 新增分类的名称
    };
  }

  render() {
    const {
      dataList = [],
      // 层级限制，默认无限制。
      maxTreeLevel = Infinity,
      title = '分类',
    } = this.props;
    const {
      adding,
      curHoverNode,
      curFocusedNode,
      addingChildrenForNode,
    } = this.state;
    const {
      handleNodeHover,
      handleNameChange,
      handleUpdate,
      handleAddChildren,
      handleEdit,
      handleConfirmDelete,
      handleDelete,
    } = this;
    const treeListProps = {
      curHoverNode,
      curFocusedNode,
      handleNodeHover,
      handleNameChange,
      handleUpdate,
      handleAddChildren,
      handleEdit,
      handleConfirmDelete,
      handleDelete,
      maxTreeLevel,
      curTreeLevel: 1,
      title,
    };
    return (
      <>
        <TreeList dataList={dataList} {...treeListProps} />
        <AddNodeModal
          title={title}
          visible={adding}
          handleNewTermNameChange={this.handleNewTermNameChange}
          addingChildrenForNode={addingChildrenForNode}
          handleCreateCancel={this.handleCreateCancel}
          handleCreate={this.handleCreate}
        />
        <div className={styles.newTerm} onClick={this.handleAddTerm}>
          <span>
            <PlusCircleOutlined />
            {`新建${title}`}
          </span>
        </div>
      </>
    );
  }

  handleDelete = (term) => {
    return () => {
      this.setState({
        disableHoverMove: term ? true : false,
      });
    };
  };

  /**
   * 处理弹层提交的数据
   * @param doc
   * @param isUpdate
   */
  handleResult = (doc, isUpdate = false) => {
    // setList：和父级组件的数据交互
    const { dataList, setList = noop } = this.props;
    let newlist;
    if (isUpdate) {
      newlist = this.updateNode(dataList, doc);
    } else {
      newlist = this.insertNode(dataList, doc);
    }

    setList(newlist);
  };

  // 更新树 data
  updateNode = (treeList, node) => {
    return treeList.map((item) => {
      if (item.id === node.id) {
        return node;
      } else if (item.children && item.children.length) {
        item.children = this.updateNode(item.children, node);
      }
      return item;
    });
  };

  // 插入树 data
  insertNode = (treeList, node) => {
    if (!node.parentId || node.parentId === '0') {
      return [node].concat(treeList);
    } else {
      return this.findParentAndInsert(treeList, node);
    }
  };

  findParentAndInsert = (treeList, node) => {
    return treeList.map((item) => {
      if (item.id === node.parentId) {
        if (item.children) {
          item.children.unshift(node);
        } else {
          item.children = [node];
        }
      } else if (item.children) {
        item.children = this.findParentAndInsert(item.children, node);
      }
      return item;
    });
  };

  deleteTreeNode = (treeList, node) => {
    return treeList.filter((item) => {
      if (item.children) {
        item.children = this.deleteTreeNode(item.children, node);
      }
      return item.id !== node.id;
    });
  };

  handleConfirmDelete = (term) => {
    return async () => {
      await this.postDeleteNode(term);
      this.setState({
        disableHoverMove: false,
      });
    };
  };

  // 递归删除写在前端了，前端已经整理好了树结构
  postDeleteNode = async (term, isRecursive) => {
    try {
      const {
        postRemove = defaultRequest,
        dataList,
        setList = noop,
      } = this.props;
      const result = await postRemove({ id: term.id });
      if (requestSuccess(result)) {
        if (term.children) {
          term.children.forEach((childNode) => {
            this.postDeleteNode(childNode, true);
          });
        }
        if (!isRecursive) {
          // 递归内无需整理树结构，最父级删除一次即可
          const newlist = this.deleteTreeNode(dataList, term);
          setList(newlist);
        }
      }
    } catch (e) {
      console.log(`postRemove(${term.id}) error: `, e);
    }
  };

  handleUpdate = (term) => {
    return async () => {
      if (term) {
        try {
          const { postUpdate = defaultRequest } = this.props;
          const result = await postUpdate({
            termId: term.id,
            title: term.title,
          });
          if (requestSuccess(result)) {
            this.handleResult(term, true);
          }
        } catch (e) {
          console.log('_postUpdate error: ', e);
        }
      }
      this.setState({
        curFocusedNode: null,
        disableHoverMove: false,
      });
    };
  };

  handleEdit = (term) => {
    return () => {
      this.setState({
        curFocusedNode: term,
        disableHoverMove: true,
      });
    };
  };

  handleNodeHover = (term) => {
    return () => {
      if (!this.state.disableHoverMove) {
        this.setState({
          curHoverNode: term,
        });
      }
    };
  };

  handleNameChange = (e) => {
    this.setState({
      curFocusedNode: {
        ...this.state.curFocusedNode,
        title: e.target.value,
      },
    });
  };

  handleNewTermNameChange = (e) => {
    this.setState({
      addingTermName: e.target.value,
    });
  };

  handleAddTerm = () => {
    this.setState({
      adding: true,
      disableHoverMove: true,
    });
  };

  handleCreateCancel = () => {
    this.setState({
      adding: false,
      disableHoverMove: false,
      addingChildrenForNode: null,
    });
  };

  handleCreate = async () => {
    try {
      const { addingTermName, addingChildrenForNode } = this.state;
      const { type, postInsert = defaultRequest } = this.props;
      if (!addingTermName) {
        message.error('请填写名称');
        return;
      }
      const params = { title: addingTermName, type };
      if (addingChildrenForNode) {
        params.parentId = addingChildrenForNode.id;
      }
      const result = await postInsert(params);
      if (requestSuccess(result)) {
        const { data } = result;
        message.success('新建成功');
        this.handleResult(data, false);
        this.setState({
          adding: false,
          disableHoverMove: false,
          addingChildrenForNode: null,
        });
      }
    } catch (e) {
      console.log('_postInsert error: ', e);
    }
  };

  handleAddChildren = (item) => {
    return () => {
      this.setState({
        addingChildrenForNode: item,
      });
      this.handleAddTerm();
    };
  };
}

function AddNodeModal(props) {
  const {
    handleNewTermNameChange,
    addingChildrenForNode,
    handleCreateCancel,
    handleCreate,
    visible,
    title,
  } = props;
  return (
    <Modal
      title={`新增${title}`}
      onCancel={handleCreateCancel}
      visible={visible}
      onOk={handleCreate}
      okText={'保存'}
      cancelText={'取消'}
      width={400}
      centered
      key={addingChildrenForNode?.id || 0}
    >
      <div className={`${styles.itemEditList} ant-list-sm`}>
        <List.Item key={`adding-term`}>
          <div className={treeStyles.emptyIcon}></div>
          <FolderOpenOutlined />
          <input
            className={styles.nameInput}
            onChange={handleNewTermNameChange}
            placeholder={
              addingChildrenForNode
                ? `为「${addingChildrenForNode.title}」添加子${title}`
                : `添加${title}`
            }
          />
        </List.Item>
      </div>
    </Modal>
  );
}

function TreeList(props) {
  const { dataList } = props;

  const renderItem = (node) => {
    return (
      <TreeNodeItem
        key={node.id}
        nodeData={node}
        curHoverNode={props.curHoverNode}
        curFocusedNode={props.curFocusedNode}
        handleNodeHover={props.handleNodeHover}
        handleNameChange={props.handleNameChange}
        handleUpdate={props.handleUpdate}
        handleAddChildren={props.handleAddChildren}
        handleEdit={props.handleEdit}
        handleConfirmDelete={props.handleConfirmDelete}
        handleDelete={props.handleDelete}
        maxTreeLevel={props.maxTreeLevel}
        curTreeLevel={props.curTreeLevel}
        title={props.title}
      />
    );
  };

  return (
    <List
      size="small"
      className={styles.itemEditList}
      header={null}
      footer={null}
      bordered={false}
      dataSource={dataList}
      onMouseLeave={props.handleNodeHover(null)}
      renderItem={renderItem}
    />
  );
}

function TreeNodeItem(props) {
  const {
    nodeData,
    curHoverNode,
    curFocusedNode,
    handleNodeHover,
    handleNameChange,
    handleUpdate,
    handleAddChildren,
    handleEdit,
    handleConfirmDelete,
    handleDelete,
    maxTreeLevel,
    curTreeLevel,
    title: modalTitle,
  } = props;
  const [showChildren, setShowChildren] = useState(false);
  const { id, title, children } = nodeData;
  const isCurHover = curHoverNode && curHoverNode.id === id;
  const isCurFocused = curFocusedNode && curFocusedNode.id === id;
  const limitedLevel = curTreeLevel >= maxTreeLevel; // 层级限制
  const hasChilren = children && children.length && !limitedLevel;
  const handleChildrenVisible = (visible) => {
    return () => setShowChildren(visible);
  };
  return (
    <>
      <List.Item
        key={`${id}-${isCurFocused ? 'focus' : ''}`}
        onMouseEnter={handleNodeHover(nodeData)}
        className={isCurHover || isCurFocused ? styles.hoverItem : ''}
      >
        {hasChilren ? (
          showChildren ? (
            <CaretDownOutlined onClick={handleChildrenVisible(false)} />
          ) : (
            <CaretRightOutlined onClick={handleChildrenVisible(true)} />
          )
        ) : (
          <div className={treeStyles.emptyIcon}></div>
        )}
        {isCurHover || isCurFocused ? (
          <FolderOpenOutlined />
        ) : (
          <FolderOutlined />
        )}
        {isCurFocused ? (
          <input
            value={curFocusedNode.title}
            className={styles.nameInput}
            onChange={handleNameChange}
          />
        ) : (
          <span className={styles.nameSpan}>{title}</span>
        )}
        {isCurHover && (
          <>
            {isCurFocused && (
              <>
                <span className={styles.edit} onClick={handleUpdate(null)}>
                  取消
                </span>
                <span
                  className={styles.edit}
                  onClick={handleUpdate(curFocusedNode)}
                >
                  完成
                </span>
              </>
            )}
            {!isCurFocused && (
              <>
                {!limitedLevel && (
                  <span
                    className={styles.edit}
                    onClick={handleAddChildren(nodeData)}
                  >
                    {`新增子${modalTitle}`}
                  </span>
                )}
                <span className={styles.edit} onClick={handleEdit(nodeData)}>
                  编辑
                </span>
              </>
            )}
            <Popconfirm
              title={`确定删除？${modalTitle}删除后无法恢复。同时其子${modalTitle}也会被删除。`}
              onConfirm={handleConfirmDelete(nodeData)}
              onCancel={handleDelete(null)}
              okText="确定"
              okType="danger"
              cancelText="取消"
            >
              <span className={styles.delete} onClick={handleDelete(nodeData)}>
                删除
              </span>
            </Popconfirm>
          </>
        )}
      </List.Item>
      {hasChilren && showChildren ? (
        <div className={treeStyles.subList}>
          <TreeList
            {...props}
            dataList={children}
            curTreeLevel={curTreeLevel + 1}
          />
        </div>
      ) : null}
    </>
  );
}
