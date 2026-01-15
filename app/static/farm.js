let PLANTS = [];

let money = 0;
const state = {
    counts: {},
    instances: {},
    upgrades: { fertilizer: 0, wateringCan: 0, sickle: false }
};

function initPlantState() {
    PLANTS.forEach(p => {
        if (!state.counts[p.id]) state.counts[p.id] = 0;
        if (!state.instances[p.id]) state.instances[p.id] = [];
    });
}

function fmt(n) { return '$' + Math.floor(n); }
function updateMoneyDisplay() {
    const el = document.getElementById('moneyDisplay');
    if (el) el.textContent = fmt(money);
}

function renderShop() {
    const shop = document.getElementById('shop');
    if (!shop) return;
    shop.innerHTML = '';
    PLANTS.forEach(p => {
        const row = document.createElement('div');
        row.className = 'flex items-center justify-between mb-3 p-2 rounded border bg-white';
        row.innerHTML = `
            <div>
                <div class="text-lg">${p.emoji} <strong>${p.name}</strong></div>
                <div class="text-sm text-gray-500">Cost: ${fmt(p.cost)} • +${p.clickValue} on click</div>
            </div>
            <div class="text-right">
                <div class="text-sm text-gray-500">Owned: <span id="count-${p.id}">${state.counts[p.id]}</span></div>
                <button class="mt-2 px-3 py-1 bg-green-500 text-white rounded buyBtn" data-id="${p.id}">Buy</button>
            </div>
        `;
        shop.appendChild(row);
    });
    shop.querySelectorAll('.buyBtn').forEach(b => b.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        buyPlant(id);
    }));
}

function buyPlant(id) {
    const p = PLANTS.find(x => x.id === id);
    if (!p) return;
    if (money >= p.cost) {
        money -= p.cost;
        state.counts[id]++;
        addPlantInstance(id);
        const counter = document.getElementById('count-' + id);
        if (counter) counter.textContent = state.counts[id];
        updateMoneyDisplay();
        renderFarmRows();
        saveGame();
    } else {
        flashMessage('Not enough money');
    }
}

function addPlantInstance(id) {
    state.instances[id].push({ ready: true, progress: 1, startTime: null });
}

function renderFarmRows() {
    const container = document.getElementById('farmRows');
    if (!container) return;
    container.innerHTML = '';
    PLANTS.forEach(p => {
        const row = document.createElement('div');
        row.className = 'p-3 border rounded bg-white';
        row.innerHTML = `<div class="flex items-center mb-2"><div class="w-40 font-medium">${p.emoji} ${p.name}</div><div class="text-sm text-gray-500">Click the plants to harvest.</div></div>`;

        const slots = document.createElement('div');
        slots.className = 'flex flex-wrap gap-2';

        const instances = state.instances[p.id];
        if (instances.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'text-sm text-gray-400';
            empty.textContent = 'No plants yet — buy some from the shop.';
            slots.appendChild(empty);
        } else {
            instances.forEach((inst, i) => {
                const el = document.createElement('div');
                el.className = 'w-24 h-24 flex flex-col items-center justify-center rounded border bg-green-50 relative cursor-pointer select-none';
                el.dataset.id = p.id;
                el.dataset.index = i;
                el.innerHTML = `
                    <div class="text-2xl">${p.emoji}</div>
                    <div class="text-sm mt-1 font-semibold">${inst.ready ? fmt(p.clickValue) : 'growing'}</div>
                    <div class="absolute bottom-0 left-0 h-1 bg-gray-200 w-full">
                        <div class="bg-green-400 h-1 progress" style="width: ${inst.progress * 100}%"></div>
                    </div>
                `;
                if (!inst.ready) el.classList.add('opacity-60');
                el.addEventListener('click', () => { handleHarvest(p.id, i); });
                slots.appendChild(el);
            });
        }

        row.appendChild(slots);
        container.appendChild(row);
    });
}

function handleHarvest(id, index) {
    const p = PLANTS.find(x => x.id === id);
    const inst = state.instances[id][index];
    if (!inst) return;
    if (inst.ready) {
        const multiplier = 1 + 0.1 * state.upgrades.wateringCan;
        const gained = p.clickValue * multiplier;
        money += gained;
        updateMoneyDisplay();
        inst.ready = false;
        inst.progress = 0;
        inst.startTime = Date.now();
        renderFarmRows();
        saveGame();
    } else {
        flashMessage('Plant is still growing');
    }
}

function sickleHarvestAll() {
    let totalHarvested = 0;
    let harvestedCount = 0;
    
    PLANTS.forEach(p => {
        const instances = state.instances[p.id];
        instances.forEach((inst, index) => {
            if (inst.ready) {
                const multiplier = 1 + 0.1 * state.upgrades.wateringCan;
                const gained = p.clickValue * multiplier;
                totalHarvested += gained;
                harvestedCount++;
                
                inst.ready = false;
                inst.progress = 0;
                inst.startTime = Date.now();
            }
        });
    });
    
    if (harvestedCount > 0) {
        money += totalHarvested;
        updateMoneyDisplay();
        renderFarmRows();
        saveGame();
        flashMessage(`Sickle harvested ${harvestedCount} crops for ${fmt(totalHarvested)}!`);
    } else {
        flashMessage('No crops ready to harvest');
    }
}

function startSickleInterval() {
    if (state.upgrades.sickle) {
        setInterval(sickleHarvestAll, 10000); // Every 30 seconds
    }
}



function tickGrowth() {
    const now = Date.now();
    PLANTS.forEach(p => {
        const instances = state.instances[p.id];
        const speedMultiplier = Math.pow(0.9, state.upgrades.fertilizer);
        const growthMs = p.growth * 1000 * speedMultiplier;
        instances.forEach(inst => {
            if (!inst.ready) {
                const elapsed = now - inst.startTime;
                inst.progress = Math.min(1, elapsed / growthMs);
                if (inst.progress >= 1) {
                    inst.ready = true;
                    inst.progress = 1;
                    inst.startTime = null;
                }
            }
        });
    });
    renderFarmRows();
}

function flashMessage(text) {
    const el = document.createElement('div');
    el.className = 'fixed bottom-6 right-6 bg-white border p-3 rounded shadow';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
}


async function saveGame() {
    try {
        await fetch('/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ money, state })
        });
    } catch (e) {
        console.error("Failed to save game", e);
    }
}

async function loadGame() {
    try {
        const resp = await fetch('/api/load');
        const data = await resp.json();

        if (data.crops) {
            PLANTS = data.crops;
            initPlantState();
        }

        if (data.money !== undefined) {
            money = data.money;
            if (data.state && Object.keys(data.state).length > 0) {
                // Merge state including upgrades
                if (data.state.upgrades) state.upgrades = data.state.upgrades;
                if (data.state.counts) state.counts = data.state.counts;
                if (data.state.instances) state.instances = data.state.instances;
            }
            updateMoneyDisplay();
            renderShop();
            renderFarmRows();
            updateUpgradeUI();
            if (state.upgrades.sickle) {
                startSickleInterval();
            }
        }
    } catch (e) {
        console.error("Failed to load game", e);
    }
}

function updateUpgradeUI() {
    const fertLevel = document.getElementById('fertLevel');
    const fertCost = document.getElementById('fertCost');
    const canLevel = document.getElementById('canLevel');
    const canCost = document.getElementById('canCost');
    const sickleStatus = document.getElementById('sickleStatus');
    const sickleCost = document.getElementById('sickleCost');

    if (fertLevel) fertLevel.textContent = state.upgrades.fertilizer;
    if (fertCost) fertCost.textContent = fmt(50 + state.upgrades.fertilizer * 25);
    if (canLevel) canLevel.textContent = state.upgrades.wateringCan;
    if (canCost) canCost.textContent = fmt(100 + state.upgrades.wateringCan * 50);
    if (sickleStatus) sickleStatus.textContent = state.upgrades.sickle;
    if (sickleCost) sickleCost.textContent = state.upgrades.sickle ? 'OWNED' : fmt(75);
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadGame();
    setInterval(tickGrowth, 500);
    setInterval(saveGame, 5000); // Auto-save every 5 seconds

    const upgradeBtn = document.getElementById('upgradeBtn');
    const upgradeModal = document.getElementById('upgradeModal');
    const closeUpgrade = document.getElementById('closeUpgrade');
    const buyFert = document.getElementById('buyFert');
    const buyCan = document.getElementById('buyCan');
    const buySickle = document.getElementById('buySickle');

    if (upgradeBtn) upgradeBtn.addEventListener('click', () => {
        if (upgradeModal) {
            upgradeModal.classList.remove('hidden');
            updateUpgradeUI();
        }
    });
    if (closeUpgrade) closeUpgrade.addEventListener('click', () => { if (upgradeModal) upgradeModal.classList.add('hidden'); });
    if (buyFert) buyFert.addEventListener('click', () => {
        const cost = 50 + state.upgrades.fertilizer * 25;
        if (money >= cost) {
            money -= cost;
            state.upgrades.fertilizer += 1;
            updateUpgradeUI();
            updateMoneyDisplay();
            saveGame();
        } else {
            flashMessage('Not enough money for fertilizer');
        }
    })
    if (buyCan) buyCan.addEventListener('click', () => {
        const cost = 100 + state.upgrades.wateringCan * 50;
        if (money >= cost) {
            money -= cost;
            state.upgrades.wateringCan += 1;
            updateUpgradeUI();
            updateMoneyDisplay();
            saveGame();
        } else {
            flashMessage('Not enough money for watering can');
        }
    })
    if (buySickle) buySickle.addEventListener('click', () => {
        if (!state.upgrades.sickle) {
            const cost = 75;
            if (money >= cost) {
                money -= cost;
                state.upgrades.sickle = true;
                updateUpgradeUI();
                updateMoneyDisplay();
                saveGame();
                startSickleInterval();
                flashMessage('Sickle purchased! Auto-harvesting every 30 seconds.');
            } else {
                flashMessage('Not enough money for sickle');
            }
        } else {
            flashMessage('You already own the sickle!');
        }
    })

    document.addEventListener('keydown', e => {
        if (e.key.toLowerCase() === 'u') {
            if (upgradeModal) {
                upgradeModal.classList.toggle('hidden');
                if (!upgradeModal.classList.contains('hidden')) updateUpgradeUI();
            }
        }
    });

    window.addEventListener('beforeunload', () => {
        saveGame();
    });
})
