const { promisify } = require('node:util');
const crypto = require('node:crypto');
const express = require('express');
const ejs = require('ejs');

const ejsRenderFile = promisify(ejs.renderFile);

let reminders = [newReminder('test'), newReminder('test2')];
const viewsPath = './src/views';

const app = express();

function newReminder(content) {
    return { content, id: crypto.randomUUID() };
}

function getComponentPath(componentFilename) {
    let componentPath = `${viewsPath}/components/${componentFilename}`;
    if (!componentPath.endsWith('.ejs')) {
        componentPath += '.ejs';
    }
    return componentPath;
}

async function ejsRenderComponent(filename, data = {}) {
    const html = await ejsRenderFile(getComponentPath(filename), data);
    return html;
}

app.set('views', viewsPath);
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/reminder', async (req, res) => {
    const reminderContent = req.body.content;
    reminders.push(newReminder(reminderContent));
    const html = await ejsRenderComponent('reminder-list', { reminders });
    res.send(html);
});

// TODO: dot it better :) 
// https://htmx.org/examples/delete-row/
app.delete('/reminder/:id', async (req, res) => {
    const id = req.params.id;
    reminders = reminders.filter(reminder => reminder.id !== id);
    const html = await ejsRenderComponent('reminder-list', { reminders });
    res.send(html);
});

app.get('/', (_req, res) => {
    res.render('index', { reminders });
});

app.listen(3000, () => console.log('server listening on port 3000'));
