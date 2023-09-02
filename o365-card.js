const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;
  
  
  class O365CardEditor extends LitElement {
      static get properties() {
          return {
              hass: Object,
              config: Object,
          };
      }
      
      get _entity() {
          if (this.config) {
              return this.config.entity || '';
          }
          
          return '';
      }
  
      get _max_items() {
          if (this.config) {
              return (this.config.max_items !== undefined) ? this.config.max_items : 0;
          }
          
          return 0;
      }
      
      get _only_overdue() {
          if (this.config) {
              return this.config.only_overdue || false;
          }
          
          return false;
      }
      
      setConfig(config) {
          this.config = config;
      }
      
      configChanged(config) {
          const e = new Event('config-changed', {
              bubbles: true,
              composed: true,
          });
          
          e.detail = {config: config};
          
          this.dispatchEvent(e);
      }
      
      getEntitiesByType(type) {
          return this.hass
              ? Object.keys(this.hass.states).filter(entity => entity.substr(0, entity.indexOf('.')) === type)
              : [];
      }
  
      isNumeric(v) {
          return !isNaN(parseFloat(v)) && isFinite(v);
      }
      
      valueChanged(e) {
          if (
              !this.config
              || !this.hass
              || (this[`_${e.target.configValue}`] === e.target.value)
          ) {
              return;
          }
          
          if (e.target.configValue) {
              if (e.target.value === '') {
                  if (!['entity', 'only_overdue'].includes(e.target.configValue)) {
                      delete this.config[e.target.configValue];
                  }
              } else {
                  this.config = {
                      ...this.config,
                      [e.target.configValue]: e.target.checked !== undefined
                          ? e.target.checked
                          : this.isNumeric(e.target.value) ? parseFloat(e.target.value) : e.target.value,
                  };
              }
          }
          
          this.configChanged(this.config);
      }
      
      render() {
          if (!this.hass) {
              return html``;
          }
          
          const entities = this.getEntitiesByType('sensor');
          const completedCount = [...Array(16).keys()];
  
          return html`<div class="card-config">
              <div class="option">
                  <ha-select
                      naturalMenuWidth
                      fixedMenuPosition
                      label="Entity (required)"
                      @selected=${this.valueChanged}
                      @closed=${(event) => event.stopPropagation()}
                      .configValue=${'entity'}
                      .value=${this._entity}
                  >
                      ${entities.map(entity => {
                          return html`<mwc-list-item .value="${entity}">${entity}</mwc-list-item>`;
                      })}
                  </ha-select>
              </div>
  
              <div class="option">
                  <ha-select
                      naturalMenuWidth
                      fixedMenuPosition
                      label="Number of elements to show (0 to disable)"
                      @selected=${this.valueChanged}
                      @closed=${(event) => event.stopPropagation()}
                      .configValue=${'max_items'}
                      .value=${this._max_items}
                  >
                      ${completedCount.map(count => {
                          return html`<mwc-list-item .value="${count}">${count}</mwc-list-item>`;
                      })}
                  </ha-select>
              </div>
              
              <div class="option">
                  <ha-switch
                   .checked=${(this.config.only_overdue !== undefined) && (this.config.only_overdue !== false)}
                          .configValue=${'only_overdue'}
                          @change=${this.valueChanged}
                  >
                  </ha-switch>
                  <span>Only show overdue (Tasks only)</span>
              </div>
          </div>`;
      }
      
      static get styles() {
          return css`
              .card-config ha-select {
                  width: 100%;
              }
              
              .option {
                  display: flex;
                  align-items: center;
                  padding: 0px 10px 20px 5px;
              }
              
              .option ha-switch {
                  margin-right: 10px;
              }
          `;
      }
  }
  
  function fireEvent(node, type, entity=null) {
      let event = new Event(type, {
        bubbles: true,
        cancelable: false,
        composed: true,
      });
      event.detail = entity || {};
      if(entity) {
        node.dispatchEvent(event);
      }
    }
  
  class O365Card extends LitElement {
    static get properties() {
      return {
        hass: {},
        config: {},
      };
    }
    
    firstUpdated() {
        if(this?.shadowRoot) {
          const soc = this.shadowRoot.getElementById('o365-card-icon');
          this._attacheEventListener(soc)
        }
      }
    
    _attacheEventListener(elem) {
        if (elem && (elem instanceof HTMLElement)) {
          elem.addEventListener('click', (e) => {
              e.stopPropagation();
              fireEvent(elem, 'hass-more-info', { entityId: this.config.entity } );
          });
        }
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
                  if (typeof(attributeValue) == 'undefined'){
                    return html`
                    <ha-card class="card">
                      <div class='title_tasks'>
                          <ha-icon id="o365-card-icon" icon="${this.hass.states[entityId].attributes['icon']}"></ha-icon> ${this.hass.states[entityId].attributes['friendly_name']} (${this.hass.states[entityId].state})
                      </div>
                      <div class='empty'>
                      No Overdue Tasks
                      </div>
                    </ha-card>
                    `;
                  }
              }else{
                  attributeValue = this.hass.states[entityId].attributes['all_tasks'];
              }
              
              if (max_item == 0){
                  if(typeof(attributeValue) != 'undefined'){
                      max_item = attributeValue.size;
                  }else{
                      max_item = 15;
                  }
              }
              let card_type;
              let options = {year: 'numeric', day:'numeric', month:'short'};
              return attributeValue ? html`
                <ha-card class="card">
                  <div class='title_tasks'>
                      <ha-icon id="o365-card-icon" icon="${this.hass.states[entityId].attributes['icon']}"></ha-icon> ${this.hass.states[entityId].attributes['friendly_name']} (${this.hass.states[entityId].state})
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
                          <ha-alert alert-type="warning">Entity <b>${entityId}</b> is not a supported o365 sensor<br/><br/>
                          Currently Supported:
                              <ul> 
                                  <li>Email/Query Sensor <a href="https://rogerselwyn.github.io/O365-HomeAssistant/installation_and_configuration.html#email_sensors" target="_blank">&#128279;</a></li>
                                  <li>Tasks/To Do Sensor <a href="https://rogerselwyn.github.io/O365-HomeAssistant/installation_and_configuration.html#todo_sensors" target="_blank">&#128279;</a></li>
                                  <li>Teams Chat Sensor <a href="https://rogerselwyn.github.io/O365-HomeAssistant/installation_and_configuration.html#chat_sensors-not-for-personal-accounts" target="_blank">&#128279;</a></li>
                              </ul>
                          </ha-alert>
                      </ha-card>`;
          }else  if (!this.hass.states[entityId].attributes['all_tasks']){
              if (!this.hass.states[entityId].attributes['from_display_name']){
                  //Email
                  const attributeValue = this.hass.states[entityId].attributes['data'];
                  if (max_item == 0){
                      if(typeof(attributeValue) != 'undefined'){
                          max_item = attributeValue.size;
                      }else{
                          max_item = 15;
                      }
                  }
                  return attributeValue ? html`
                    <ha-card class="card">
                      <div class='title'>
                          <ha-icon id="o365-card-icon" icon="${this.hass.states[entityId].attributes['icon']}"></ha-icon> <a href="https://outlook.office365.com/mail/" target="_blank">${this.hass.states[entityId].attributes['friendly_name']}</a> (${this.hass.states[entityId].state})
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
                          <ha-alert alert-type="warning">Entity <b>${entityId}</b> is not a supported o365 sensor<br/><br/>
                          Currently Supported:
                              <ul> 
                                  <li>Email/Query Sensor <a href="https://rogerselwyn.github.io/O365-HomeAssistant/installation_and_configuration.html#email_sensors" target="_blank">&#128279;</a></li>
                                  <li>Tasks/To Do Sensor <a href="https://rogerselwyn.github.io/O365-HomeAssistant/installation_and_configuration.html#todo_sensors" target="_blank">&#128279;</a></li>
                                  <li>Teams Chat Sensor <a href="https://rogerselwyn.github.io/O365-HomeAssistant/installation_and_configuration.html#chat_sensors-not-for-personal-accounts" target="_blank">&#128279;</a></li>
                              </ul>
                          </ha-alert>
                      </ha-card>`;
              }else{
                  //Teams Message
                  let t = new Date(this.hass.states[entityId].state);
                  return html`
                  <ha-card class="card">
                      <div class='title'>
                          <ha-icon id="o365-card-icon" icon="${this.hass.states[entityId].attributes['icon']}"></ha-icon> ${this.hass.states[entityId].attributes['friendly_name']} Last Message
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
      return { entity: "sensor.inbox", max_items: 0, only_overdue: false }
    }
    
    static getConfigElement() {
          return document.createElement('o365-card-editor');
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
        .empty{
            font-weight: bold;
            font-size: 15px;
            padding: 10px 10px 0 0; 
            text-align: center;
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
  customElements.define('o365-card', O365Card);
  customElements.define('o365-card-editor', O365CardEditor);
  
  window.customCards = window.customCards || [];
  window.customCards.push({
      type: "o365-card",
      name: "O365 Card",
      description: "A custom card to show your Inbox, To Do and Teams Last Message from O365" // optional
  });
  