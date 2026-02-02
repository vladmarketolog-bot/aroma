const { Telegraf, Markup } = require('telegraf');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = parseInt(process.env.ADMIN_ID);
const MINI_APP_URL = process.env.MINI_APP_URL || 'https://your-domain.com';

if (!BOT_TOKEN || !ADMIN_ID) {
    console.error('❌ Ошибка: BOT_TOKEN и ADMIN_ID должны быть указаны в .env файле');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);
const USERS_FILE = path.join(__dirname, 'users.json');

// ============= USER MANAGEMENT =============

function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    }
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (err) {
        console.error('Ошибка чтения users.json:', err);
        return [];
    }
}

function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error('Ошибка записи users.json:', err);
    }
}

function addUser(ctx) {
    const users = loadUsers();
    const userId = ctx.from.id;

    const existingUser = users.find(u => u.id === userId);

    if (!existingUser) {
        const userData = {
            id: userId,
            first_name: ctx.from.first_name,
            last_name: ctx.from.last_name || '',
            username: ctx.from.username || '',
            registered_at: new Date().toISOString(),
            last_active: new Date().toISOString()
        };
        users.push(userData);
        saveUsers(users);
        console.log(`✅ Новый пользователь: ${userData.first_name} (ID: ${userId})`);
        return true;
    } else {
        // Обновляем последнюю активность
        existingUser.last_active = new Date().toISOString();
        saveUsers(users);
        return false;
    }
}

function isAdmin(userId) {
    return userId === ADMIN_ID;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============= BOT COMMANDS =============

// Команда /start
bot.start((ctx) => {
    const isNew = addUser(ctx);

    const welcomeMessage = isNew
        ? '✨ <b>Добро пожаловать в ScentMatrix!</b>\n\n🧪 Создавайте уникальные парфюмерные комбинации с помощью AI\n\n👇 Нажмите кнопку ниже, чтобы открыть приложение'
        : '🧪 <b>С возвращением в ScentMatrix!</b>\n\n👇 Нажмите кнопку ниже, чтобы продолжить';

    ctx.reply(
        welcomeMessage,
        {
            parse_mode: 'HTML',
            ...Markup.inlineKeyboard([
                [Markup.button.webApp('🧪 Открыть ScentMatrix', MINI_APP_URL)]
            ])
        }
    );
});

// Команда /help
bot.command('help', (ctx) => {
    addUser(ctx); // Обновляем активность

    ctx.reply(
        '🧪 <b>ScentMatrix - Ваш AI парфюмер</b>\n\n' +
        '<b>Как пользоваться:</b>\n' +
        '1️⃣ Нажмите кнопку меню\n' +
        '2️⃣ Добавьте ароматы из вашей коллекции\n' +
        '3️⃣ Выберите настроение\n' +
        '4️⃣ Получите персональные рецепты!\n\n' +
        '<b>Команды:</b>\n' +
        '/start - Открыть приложение\n' +
        '/help - Эта справка\n\n' +
        '💡 <i>Совет: используйте Лабораторию для проверки совместимости любых двух ароматов!</i>',
        { parse_mode: 'HTML' }
    );
});

// ============= ADMIN COMMANDS =============

// /stats - Статистика
bot.command('stats', (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('⛔️ Эта команда доступна только администратору.');
    }

    const users = loadUsers();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const newToday = users.filter(u => {
        const regDate = new Date(u.registered_at);
        return regDate >= today;
    }).length;

    ctx.reply(
        `📊 <b>Статистика ScentMatrix Bot</b>\n\n` +
        `👥 Всего пользователей: <b>${users.length}</b>\n` +
        `🆕 Новых сегодня: <b>${newToday}</b>`,
        { parse_mode: 'HTML' }
    );
});

// /users - Список пользователей
bot.command('users', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('⛔️ Эта команда доступна только администратору.');
    }

    const users = loadUsers();

    if (users.length === 0) {
        return ctx.reply('📭 Пока нет зарегистрированных пользователей.');
    }

    let message = `👥 <b>Список пользователей (${users.length})</b>\n\n`;

    // Показываем до 30 пользователей (чтобы не превысить лимит)
    const displayUsers = users.slice(0, 30);

    for (let i = 0; i < displayUsers.length; i++) {
        const user = displayUsers[i];
        const name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        const username = user.username ? `@${user.username}` : 'нет username';
        const date = new Date(user.registered_at).toLocaleDateString('ru-RU');

        message += `${i + 1}. <b>${name}</b>\n`;
        message += `   ${username} | ID: <code>${user.id}</code>\n`;
        message += `   📅 ${date}\n\n`;
    }

    if (users.length > 30) {
        message += `\n<i>... и ещё ${users.length - 30} пользователей</i>\n\n`;
        message += `💡 Используйте /export для получения полного списка`;
    }

    ctx.reply(message, { parse_mode: 'HTML' });
});

// /broadcast - Рассылка
bot.command('broadcast', async (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('⛔️ Эта команда доступна только администратору.');
    }

    const message = ctx.message.text.replace('/broadcast', '').trim();

    if (!message) {
        return ctx.reply(
            '❌ <b>Укажите текст сообщения:</b>\n\n' +
            '<code>/broadcast Ваш текст здесь</code>\n\n' +
            '💡 Поддерживается HTML-форматирование:\n' +
            '<code>&lt;b&gt;жирный&lt;/b&gt;</code>\n' +
            '<code>&lt;i&gt;курсив&lt;/i&gt;</code>',
            { parse_mode: 'HTML' }
        );
    }

    const users = loadUsers();
    let success = 0;
    let failed = 0;

    const statusMsg = await ctx.reply(
        `📢 Начинаю рассылку для ${users.length} пользователей...\n\n` +
        `⏳ Это займёт примерно ${Math.ceil(users.length * 0.05)} секунд`
    );

    for (const user of users) {
        try {
            await bot.telegram.sendMessage(user.id, message, {
                parse_mode: 'HTML',
                ...Markup.inlineKeyboard([
                    [Markup.button.webApp('🧪 Открыть ScentMatrix', MINI_APP_URL)]
                ])
            });
            success++;
            await sleep(50); // Rate limit protection
        } catch (err) {
            failed++;
            if (err.response?.error_code === 403) {
                console.log(`Пользователь ${user.id} заблокировал бота`);
            } else {
                console.error(`Ошибка отправки ${user.id}:`, err.message);
            }
        }
    }

    await ctx.telegram.editMessageText(
        ctx.chat.id,
        statusMsg.message_id,
        null,
        `✅ <b>Рассылка завершена!</b>\n\n` +
        `✓ Успешно: ${success}\n` +
        `✗ Ошибок: ${failed}${failed > 0 ? ' (заблокировали бота)' : ''}`,
        { parse_mode: 'HTML' }
    );
});

// /export - Экспорт пользователей в CSV
bot.command('export', (ctx) => {
    if (!isAdmin(ctx.from.id)) {
        return ctx.reply('⛔️ Эта команда доступна только администратору.');
    }

    const users = loadUsers();

    if (users.length === 0) {
        return ctx.reply('📭 Нет пользователей для экспорта.');
    }

    let csv = 'ID,Имя,Фамилия,Username,Дата регистрации,Последняя активность\n';

    users.forEach(user => {
        csv += `${user.id},"${user.first_name}","${user.last_name}",${user.username || 'нет'},${user.registered_at},${user.last_active || 'н/д'}\n`;
    });

    const filename = `users_${new Date().toISOString().split('T')[0]}.csv`;
    const filepath = path.join(__dirname, filename);

    fs.writeFileSync(filepath, csv);

    ctx.replyWithDocument({ source: filepath, filename }, {
        caption: `📊 Экспорт пользователей\n\nВсего: ${users.length} пользователей`
    }).then(() => {
        // Удаляем файл после отправки
        fs.unlinkSync(filepath);
    }).catch(err => {
        console.error('Ошибка отправки файла:', err);
        ctx.reply('❌ Ошибка при создании файла экспорта');
    });
});

// ============= ERROR HANDLING =============

bot.catch((err, ctx) => {
    console.error(`Ошибка для пользователя ${ctx.from?.id}:`, err);
    ctx.reply('❌ Произошла ошибка. Попробуйте позже.').catch(() => { });
});

// ============= LAUNCH =============

bot.launch().then(() => {
    console.log('✅ ScentMatrix Bot запущен!');
    console.log(`👤 Администратор: ${ADMIN_ID}`);
    console.log(`🔗 Mini App URL: ${MINI_APP_URL}`);
    console.log(`\n📊 Пользователей в базе: ${loadUsers().length}`);
}).catch(err => {
    console.error('❌ Ошибка запуска бота:', err);
    process.exit(1);
});

// Graceful shutdown
process.once('SIGINT', () => {
    console.log('\n⏹️  Остановка бота...');
    bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
    console.log('\n⏹️  Остановка бота...');
    bot.stop('SIGTERM');
});
