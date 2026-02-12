import { useResolveOptions, ref } from "@actview/core"
import { MyInput } from "@/components/input"
import './input.css'

const inputValue = ref('')
const refInput = ref<HTMLInputElement | null>(null)

function handleInput(e: Event) {
    const target = e.target as HTMLInputElement
    inputValue.value = target.value
}

function handleClear() {
    inputValue.value = ''
    refInput.value?.focus()
}

export const Input = () => {
    inputValue.value = ''
    useResolveOptions([
        {
            selector: '[data-id="clearable-input"] .input-clear',
            listeners: [{ type: 'click', callback: handleClear }],
        },
        {
            selector: '[data-id="clearable-input"] input',
            listeners: [{ type: 'input', callback: handleInput }],
            ref: refInput,
            value: () => inputValue.value,
        },
        {
            selector: '[data-id="demo-input"] input',
            listeners: [{ type: 'input', callback: handleInput }],
            value: () => inputValue.value,
        },
        {
            selector: '#input-output',
            text: () => `输入内容: ${inputValue.value}`,
        },
    ])
    return (
        <>
            <div class="section">
                <h2>输入框类型 / Input Types</h2>
                <div class="input-vertical">
                    <MyInput type="primary" placeholder="Primary 输入框" />
                    <MyInput type="success" placeholder="Success 输入框" />
                    <MyInput type="danger" placeholder="Danger 输入框" />
                    <MyInput type="warning" placeholder="Warning 输入框" />
                </div>
            </div>
            <div class="section">
                <h2>输入框尺寸 / Input Sizes</h2>
                <div class="input-vertical">
                    <MyInput type="primary" size="sm" placeholder="Small 输入框" />
                    <MyInput type="primary" placeholder="Default 输入框" />
                    <MyInput type="primary" size="lg" placeholder="Large 输入框" />
                </div>
            </div>
            <div class="section">
                <h2>输入框状态 / Input States</h2>
                <div class="input-vertical">
                    <MyInput type="primary" placeholder="正常状态" />
                    <MyInput type="primary" disabled placeholder="禁用状态" value="Disabled" />
                    <MyInput type="primary" readonly value="只读内容 - Readonly" />
                </div>
            </div>
            <div class="section">
                <h2>可清除 / Clearable</h2>
                <div class="input-vertical">
                    <MyInput type="primary" clearable placeholder="输入后可清除" data-id="clearable-input" />
                </div>
            </div>
            <div class="section">
                <h2>原生类型 / Native Types</h2>
                <div class="input-vertical">
                    <div class="label-row"><span style="min-width:60px">text:</span><MyInput placeholder="文本输入" /></div>
                    <div class="label-row"><span style="min-width:60px">number:</span><MyInput input-type="number" placeholder="数字输入" /></div>
                    <div class="label-row"><span style="min-width:60px">email:</span><MyInput input-type="email" placeholder="邮箱输入" /></div>
                    <div class="label-row"><span style="min-width:60px">tel:</span><MyInput input-type="tel" placeholder="电话输入" /></div>
                </div>
            </div>
            <div class="section">
                <h2>交互演示 / Interactive Demo</h2>
                <div class="input-vertical">
                    <MyInput type="primary" placeholder="输入内容实时显示..." data-id="demo-input" />
                </div>
                <p id="input-output">输入内容: </p>
            </div>
        </>
    )
}
