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

function renderFarmRows() {
    const farm = document.getElementById('farmRows')
    if (!farm) return

    farm.innerHTML = ''

    PLANTS.forEach(plant => {
        const row = document.createElement('div')
        row.className = 'p-3 border rounded bg-white'

        row.innerHTML = `
            <div class="flex items-center mb-2">
                <div class="w-40 font-medium">${plant.emoji} ${plant.name}</div>
                <div class="text-sm text-gray-500">Click the plants to harvest.</div>
            </div>
        `

        const slots = document.createElement('div')
        slots.className = 'flex flex-wrap gap-2'

        const instances = state.plantSlots[plant.id]

        if (instances.length === 0) {
            const empty = document.createElement('div')
            empty.className = 'text-sm text-gray-400'
            empty.textContent = 'No plants yet — buy some from the shop.'
            slots.appendChild(empty)
        } else {
            instances.forEach((inst, index) => {
                const tile = document.createElement('div')
                tile.className = 'w-24 h-24 flex flex-col items-center justify-center rounded border bg-green-50 relative cursor-pointer select-none'

                if (!inst.ready) tile.classList.add('opacity-60')

                tile.innerHTML = `
                    <div class="text-2xl">${plant.emoji}</div>
                    <div class="text-sm mt-1 font-semibold">
                        ${inst.ready ? fmt(plant.clickValue) : 'growing'}
                    </div>
                    <div class="absolute bottom-0 left-0 h-1 bg-gray-200 w-full">
                        <div class="bg-green-400 h-1" style="width:${inst.progress * 100}%"></div>
                    </div>
                `

                tile.addEventListener('click', () => {
                    handleHarvest(plant.id, index)
                })

                slots.appendChild(tile)
            })
        }

        row.appendChild(slots)
        farm.appendChild(row)
    })
}

function handleHarvest(id, index) {
    const plant = PLANTS.find(p => p.id === id)
    const inst = state.plantSlots[id][index]
    if (!plant || !inst) return

    if (!inst.ready) {
        flashMessage('Plant is still growing')
        return
    }

    const bonus = 1 + state.upgrades.fertilizer * 0.1
    money += plant.clickValue * bonus

    inst.ready = false
    inst.progress = 0
    inst.startTime = Date.now()

    updateMoneyDisplay()
    renderFarmRows()
}

document.addEventListener('DOMContentLoaded', () => {
    money = 20
    updateMoneyDisplay()

    renderShop()
    renderFarmRows()

    setInterval(tickGrowth, 500)

    const upgradeBtn = document.getElementById('upgradeBtn')
    const upgradeModal = document.getElementById('upgradeModal')
    const closeUpgrade = document.getElementById('closeUpgrade')
    const buyFert = document.getElementById('buyFert')
    const fertLevel = document.getElementById('fertLevel')

    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            upgradeModal.classList.remove('hidden')
        })
    }

    if (closeUpgrade) {
        closeUpgrade.addEventListener('click', () => {
            upgradeModal.classList.add('hidden')
        })
    }

    if (buyFert) {
        buyFert.addEventListener('click', () => {
            const cost = 50 + state.upgrades.fertilizer * 25

            if (money < cost) {
                flashMessage('Not enough money for fertilizer')
                return
            }

            money -= cost
            state.upgrades.fertilizer++
            fertLevel.textContent = state.upgrades.fertilizer
            updateMoneyDisplay()
        })
    }

    document.addEventListener('keydown', e => {
        if (e.key.toLowerCase() === 'u') {
            upgradeModal.classList.toggle('hidden')
        }
    })
})
