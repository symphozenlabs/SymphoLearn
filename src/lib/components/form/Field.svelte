<!--
	Field — label, input, hint and error in one accessible unit.
	Password fields get a show/hide toggle.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { Eye, EyeOff } from '@lucide/svelte';

	interface Props extends Omit<HTMLInputAttributes, 'value'> {
		label: string;
		id: string;
		value?: string;
		error?: string;
		hint?: string;
		optional?: boolean;
		icon?: Snippet;
		input?: HTMLInputElement;
	}

	let {
		label,
		id,
		value = $bindable(''),
		error,
		hint,
		optional = false,
		icon,
		type = 'text',
		input = $bindable(),
		...rest
	}: Props = $props();

	let reveal = $state(false);
	const isPassword = $derived(type === 'password');
	const describedBy = $derived([error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined);
</script>

<div class="field" class:invalid={!!error}>
	<label for={id}>
		{label}
		{#if optional}<span class="opt">Optional</span>{/if}
	</label>
	<div class="control" class:has-icon={!!icon}>
		{#if icon}<span class="icon" aria-hidden="true">{@render icon()}</span>{/if}
		<input
			{id}
			name={id}
			bind:this={input}
			bind:value
			type={isPassword && reveal ? 'text' : type}
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			{...rest}
		/>
		{#if isPassword}
			<button
				type="button"
				class="peek"
				onclick={() => (reveal = !reveal)}
				aria-label={reveal ? 'Hide password' : 'Show password'}
				aria-pressed={reveal}
			>
				{#if reveal}<EyeOff size={17} strokeWidth={1.6} />{:else}<Eye size={17} strokeWidth={1.6} />{/if}
			</button>
		{/if}
	</div>
	{#if error}
		<p class="msg err" id="{id}-err" role="alert">{error}</p>
	{:else if hint}
		<p class="msg" id="{id}-hint">{hint}</p>
	{/if}
</div>

<style>
	.field {
		display: grid;
		gap: 0.45rem;
		align-content: start;
		min-width: 0;
	}
	label {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: 0.84rem;
		font-weight: 500;
		color: var(--ink);
	}
	.opt {
		font-size: 0.74rem;
		font-weight: 400;
		color: var(--text-muted);
	}
	.control {
		position: relative;
	}
	input {
		width: 100%;
		height: 3.15rem;
		padding: 0 1rem;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-md);
		background: var(--surface);
		font: inherit;
		font-size: 0.95rem;
		color: var(--ink);
		transition:
			border-color var(--duration-normal) var(--ease-out),
			box-shadow var(--duration-normal) var(--ease-out),
			background var(--duration-normal) var(--ease-out);
	}
	input::placeholder {
		color: var(--gray-500);
	}
	input:hover {
		border-color: var(--gray-500);
	}
	input:focus {
		outline: none;
		border-color: var(--brand-primary);
		box-shadow: 0 0 0 4px rgb(90 138 69 / 0.14);
	}
	input[readonly] {
		background: var(--surface-soft);
		color: var(--text-secondary);
	}
	.has-icon input {
		padding-left: 2.75rem;
	}
	.icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		translate: 0 -50%;
		display: flex;
		color: var(--text-muted);
		pointer-events: none;
		transition: color var(--duration-normal);
	}
	.control:focus-within .icon {
		color: var(--brand-primary);
	}
	input[type='password'],
	.control:has(.peek) input {
		padding-right: 3rem;
	}
	.peek {
		position: absolute;
		right: 0.4rem;
		top: 50%;
		translate: 0 -50%;
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border: 0;
		border-radius: var(--radius-sm);
		background: none;
		color: var(--text-muted);
	}
	.peek:hover {
		color: var(--ink);
		background: var(--surface-soft);
	}
	.msg {
		font-size: 0.78rem;
		color: var(--text-muted);
	}
	.err {
		color: var(--error);
		animation: shake 360ms var(--ease-out);
	}
	.invalid input {
		border-color: var(--error);
	}
	.invalid input:focus {
		box-shadow: 0 0 0 4px rgb(181 72 59 / 0.12);
	}
	@keyframes shake {
		25% {
			translate: -3px 0;
		}
		60% {
			translate: 2px 0;
		}
	}
</style>
