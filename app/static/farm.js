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
