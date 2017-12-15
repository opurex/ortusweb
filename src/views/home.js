var view_home = `
{{#user}}
<p>Bonjour {{user}}</p>
<p>Vous êtes connectés sur {{server}}.</p>
{{/user}}
{{#hasData}}
<p>Les données ont été chargées le <span id="home-sync-date">{{sync_date}}</span> à <span id="home-sync-time">{{sync_time}}</span>.</p>
{{/hasData}}
<p><button class="btn btn-primary" onclick="javascript:home_sendSync();">Recharger les données</button></p>
`;
