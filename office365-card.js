import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@3.3.2/lit-element.js?module";


class Office365MailTodoView extends LitElement {
  static get properties() {
    return {
      hass: {},
      config: {},
    };
  }

  render() {
    const entityId = this.config.entity;
    let max_item = this.config.max_items;
    let options_completed = {year: 'numeric', day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'};
    if (!!this.hass.states[entityId]){
        if(!this.hass.states[entityId].attributes['data']) {
            // Tasks
            let attributeValue;
            if(this.config.only_overdue == true){
                attributeValue = this.hass.states[entityId].attributes['overdue_tasks'];
            }else{
                attributeValue = this.hass.states[entityId].attributes['all_tasks'];
            }
            
            if (max_item == 0){
                max_item = attributeValue.size;
            }
            let card_type;
            let options = {year: 'numeric', day:'numeric', month:'short'};
            return attributeValue ? html`
              <ha-card class="card">
                <div class='title_tasks'>
                    <ha-icon icon="${this.hass.states[entityId].attributes['icon']}"></ha-icon> ${this.hass.states[entityId].attributes['friendly_name']} (${this.hass.states[entityId].state})
                </div>
                <ul class="separator">
                ${attributeValue.slice(0,max_item).map(entry => {
                    if (!entry.due){
                        card_type="info"; 
                        return entry.subject ? html`           
                                 <li>
                                    <ha-alert alert-type=${entry.completed ? "success" :card_type} class="tasks"><div class="${entry.completed ? "completed": ""}">${entry.subject} 
                                        <a href="https://to-do.office.com/tasks/id/${entry.task_id}" target="_blank">&#128279;</a></div>
                                        <div>${ entry.completed ? ( entry.completed != false ? 'Completed on: '+new Date(entry.completed).toLocaleDateString("en-US", options) : '' ) : '' }</div>
                                    </ha-alert>
                                 </li>`: html`<li>
                                                <ha-card class="not-found">
                                                       <ha-alert alert-type="warning">Entity <b>${entityId}</b> is not a valid o365 task item.</ha-alert>
                                                </ha-card>
                                              </li>`;
                        
                    }else{
                        let now = new Date().getTime();
                        let due = new Date(entry.due);
                        //Fix date transform
                        due.setHours(due.getHours() + 24);
                        //Its overdue?
                        if(now < due.getTime()){  
                            //no
                            card_type="warning";
                        }else{
                           //yes
                           card_type="error";
                        }
                        return entry.subject ? html`           
                                 <li><ha-alert alert-type=${entry.completed ? "success" :card_type} class="tasks"><div class="${entry.completed ? "completed": ""}">${entry.subject} 
                                        <a href="https://to-do.office.com/tasks/id/${entry.task_id}" target="_blank">&#128279;</a></div>
                                        <div>Due date: <b>${due.toLocaleDateString("en-US", options)}</b></div>
                                        <div>${ entry.completed ? ( entry.completed != false ? 'Completed on: '+new Date(entry.completed).toLocaleDateString("en-US", options) : '' ) : '' }</div>
                                     </ha-alert>
                                 </li>`: html`<li>
                                                <ha-card class="not-found">
                                                       <ha-alert alert-type="warning">Entity <b>${entityId}</b> is not a valid o365 task item.</ha-alert>
                                                </ha-card>
                                              </li>`;
                    }
                    
                })}
                </ul>
              </ha-card>
            `: html`<ha-card class="not-found">
                        <ha-alert alert-type="warning">Entity <b>${entityId}</b> is not a valid o365 sensor.</ha-alert>
                    </ha-card>`;
        }else  if (!this.hass.states[entityId].attributes['all_tasks']){
            if (!this.hass.states[entityId].attributes['from_display_name']){
                //Email
                const attributeValue = this.hass.states[entityId].attributes['data'];
                if (max_item == 0){
                    max_item = attributeValue.size;
                }
                return attributeValue ? html`
                  <ha-card class="card">
                    <div class='title'>
                        <ha-icon icon="${this.hass.states[entityId].attributes['icon']}"></ha-icon> ${this.hass.states[entityId].attributes['friendly_name']} (${this.hass.states[entityId].state})
                    </div>
                    ${attributeValue.slice(0,max_item).map(entry => {
                            let t = new Date(entry.received);
                            let card_type="info"; 
                            if (entry.importance != "normal"){
                                al_type="error"; 
                            }
                             return entry.subject ? html`   
                                 <div class="state">
                                     <ha-alert  alert-type=${card_type}>
                                         <div>
                                            <b>${entry.subject}</b>
                                         </div> 
                                         <div>
                                            <b>From: </b><a href="mailto:${entry.sender}">${entry.sender}</a>
                                         </div>
                                         <div>
                                            <b>Date: </b>${t.toLocaleDateString("en-US", options_completed)}
                                         </div>
                                     </ha-alert>
                                 </div>`
                                 : html`<ha-card class="not-found">
                                            <ha-alert alert-type="warning">Entity <b>${entityId}</b> is not a valid o365 mail item.</ha-alert>
                                        </ha-card>`;
                        })}
                  </ha-card>
                `: html`<ha-card class="not-found">
                        <ha-alert alert-type="warning">Entity <b>${entityId}</b> is not a valid o365 sensor.</ha-alert>
                    </ha-card>`;
            }else{
                //Teams Message
                let t = new Date(this.hass.states[entityId].state);
                return html`
                <ha-card class="card">
                    <div class='title'>
                        <ha-icon icon="${this.hass.states[entityId].attributes['icon']}"></ha-icon> ${this.hass.states[entityId].attributes['friendly_name']} Last Message
                    </div>
                    <div class="list"><b>From: </b>${this.hass.states[entityId].attributes['from_display_name']} </div>
                    <div class="list"><b>At: </b>${t.toLocaleDateString("en-US", options_completed)}</div>
                    <div class="list"><b>Message: </b>${this.hass.states[entityId].attributes['content'].replace(/(<([^>]+)>)/gi, "")}</div>
                    <br>
                    <div class="list">Open in <a href="https://teams.microsoft.com/_#/conversations/${  this.hass.states[entityId].attributes['chat_id']}?ctx=chat" target="_blank">Teams</a></div>
                </ha-card>`;
            }
            
        }
            
    }else{
        return html`<ha-card class="not-found">
                    <ha-alert alert-type="error">Entity <b>${entityId}</b> not found.</ha-alert>
                </ha-card>`;
    }
    
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define an entity");
    }
    this.config = config;
  }

  
  getCardSize() {
    let size;
    if ( typeOf(this.config.max_items) != "unavailable"){
        if (this.config.max_items == 0){
            size = this.config.entity.state + 1;
        }else{
            size = this.config.max_items + 1;
        }
    }else{
        size = this.config.entity.state + 1;
    }
    return size;
  }

  static getStubConfig() {
    return { entity: "sensor.inbox", max_items: 4, only_overdue: false }
  }


  static get styles() {
    return css`
      :host {
        
      }
      .title_tasks {
          font-weight: bold;
          font-size: 20px;
          text-transform: uppercase;
          padding: 6px 0 0 0;
        }
      .title {
          font-weight: bold;
          font-size: 20px;
          text-transform: uppercase;
          padding: 6px 0 16px 0;
        }
      ul.separator {
      	list-style: none;
      	padding: 0;
      	width: 100%;
      }
        
      ul.separator li {
        padding: .5em 0 0 0;
      	
      }
      ul.separator li:last-child {
        border-bottom: 0;
      }
      a{
        color: #339CFF;
      }
      .card{
          padding: 16px;
      }
      .state {
        justify-content: space-between;
        padding: 8px;
        align-items: center;
      }
      .list {
        padding: 5px 1em 0 2em;
      }
      .completed {
        text-decoration: line-through;
      }
      .tasks {
        padding: 0px 0em 0px 0px;
      }
      .not-found {
        font-size: 14px;
        padding: 8px;
      }
    `;
  }
}
customElements.define('office365-card', Office365MailTodoView);

window.customCards = window.customCards || [];
window.customCards.push({
    type: "office365-card",
    name: "Office365 Card",
    description: "A custom card to show your Inbox, To Do and Teams Last Message from Office365" // optional
});

