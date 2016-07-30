import React from 'react';
import ReactDOM from 'react-dom';
import MongoClient from 'baas';

let client = new MongoClient("baas_test", "http://localhost:8080/v1/app/test")

function TodoItem({item=null, checkHandler=null}){
  let itemClass = item.checked ? "done" : "";
  return (
    <li>
      <label>
      <input type="checkbox"
        checked={item.checked}
        onChange={ (event) => { checkHandler(item._id, event.target.checked) }}
      />
      <span className={itemClass}>{item.text}</span></label>
    </li>
  )
}

var TodoList = React.createClass({
  setItems: function(items){ this.setState({items:items}) },
  loadList: function(){
    let obj = this;
    client.find("todo", {}, null, function(data){
      obj.setState({items:data.result})
    })
  },

  getInitialState: () => {return {items:[]}},
  componentWillMount: function(){this.loadList()},
  checkHandler: function(id, status){
    client.update("todo", {_id:id}, {$set:{"checked":status}}, false, false, () => {
      this.loadList();
    })
  },

  addItem: function(event){
    if(event.keyCode != 13 ){
      return
    }
    client.insert("todo", [{text:event.target.value}], () => {
      this.loadList();
    })
  },

  clear: function(){
    client.remove("todo", {checked:true}, false, () => {
      this.loadList();
    })
  },

  render: function(){
    return (
      <div>
        <input type="text" placeholder="add a new item..." onKeyDown={this.addItem}/>
        <div>
          <button onClick={this.clear}>Clean up</button>
        </div>
        <ul>
        { 
          this.state.items.length == 0
          ?  <div>list is empty :(</div>
           : this.state.items.map((item) => {
            return <TodoItem key={item._id.$oid} item={item} checkHandler={this.checkHandler}/>;
          }) 
        }
        </ul>
      </div>
    );
  }
})

let list = <TodoList items={[]}/>

$(document).ready(() => {
  if (client.recoverAuth() == null) {
    $("#login_oauth2_google").prop('disabled', false);
    $("#login_oauth2_google").click(function(e) {
      client.authWithOAuth("google");
    });
    $("#login_oauth2_fb").prop('disabled', false);
    $("#login_oauth2_fb").click(function(e) {
      client.authWithOAuth("facebook");
    });
    return;
  }

  $("#logout").prop('disabled', false);
  $("#logout").click(function(e) {
    client.logout();
  });
  ReactDOM.render(list, document.getElementById('app'));
})
