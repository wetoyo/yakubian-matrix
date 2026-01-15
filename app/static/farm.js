const PLANTS = [
    { id: 'carrot', name: 'Carrot', cost: 5, clickValue: 1, growth: 3, emoji: '🥕' },
    { id: 'tomato', name: 'Tomato', cost: 25, clickValue: 5, growth: 6, emoji: '🍅' },
    { id: 'wheat', name: 'Wheat', cost: 100, clickValue: 20, growth: 12, emoji: '🌾' },
    { id: 'pumpkin', name: 'Pumpkin', cost: 500, clickValue: 120, growth: 30, emoji: '🎃' }
]

let money = 0

const state = {
    ownedPlants: {},
    plantSlots: {},
    upgrades: {
        fertilizer: 0
    }
}

PLANTS.forEach(plant => {
    state.ownedPlants[plant.id] = 0
    state.plantSlots[plant.id] = []
})

function fmt(num) {
    return '$' + Math.floor(num)
}

function updateMoneyDisplay() {
    const display = document.getElementById('moneyDisplay')
    if (display) {
        display.textContent = fmt(money)
    }
}

function flashMessage(text) {
    const msg = document.createElement('div')
    msg.className = 'fixed bottom-6 right-6 bg-white border p-3 rounded shadow'
    msg.textContent = text
    document.body.appendChild(msg)

    setTimeout(() => {
        msg.remove()
    }, 1400)
}

function renderShop() {
    const shopEl = document.getElementById('shop')
    if (!shopEl) return

    shopEl.innerHTML = ''

    PLANTS.forEach(plant => {
        const row = document.createElement('div')
        row.className = 'flex items-center justify-between mb-3 p-2 rounded border bg-white'

        row.innerHTML = `
            <div>
                <div class="text-lg">${plant.emoji} <strong>${plant.name}</strong></div>
                <div class="text-sm text-gray-500">
                    Cost: ${fmt(plant.cost)} • +${plant.clickValue} per harvest
                </div>
            </div>
            <div class="text-right">
                <div class="text-sm text-gray-500">
                    Owned: <span id="count-${plant.id}">${state.ownedPlants[plant.id]}</span>
                </div>
                <button class="buyBtn mt-2 px-3 py-1 bg-green-500 text-white rounded" data-id="${plant.id}">
                    Buy
                </button>
            </div>
        `

        shopEl.appendChild(row)
    })

    shopEl.querySelectorAll('.buyBtn').forEach(btn => {
        btn.addEventListener('click', e => {
            buyPlant(e.currentTarget.dataset.id)
        })
    })
}

function buyPlant(id) {
    const plant = PLANTS.find(p => p.id === id)
    if (!plant) return

    if (money < plant.cost) {
        flashMessage('Not enough money')
        return
    }

    money -= plant.cost
    state.ownedPlants[id]++

    addPlantInstance(id)

    const counter = document.getElementById('count-' + id)
    if (counter) counter.textContent = state.ownedPlants[id]

    updateMoneyDisplay()
    renderFarmRows()
}

function addPlantInstance(id) {
    state.plantSlots[id].push({
        ready: true,
        progress: 1,
        startTime: null
    })
}
