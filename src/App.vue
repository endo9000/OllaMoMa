<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';

import { Icon } from '@iconify/vue';
import { Loader2 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { useColorMode } from '@vueuse/core';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
	Card,
	// CardContent,
	CardDescription,
	// CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuRadioGroup,
//   DropdownMenuRadioItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Toaster } from '@/components/ui/sonner';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Ollama } from 'ollama/browser';

const mode = useColorMode();

const newName = ref('');

const base_url = 'http://127.0.0.1:11434';
const ollama = new Ollama({ host: base_url });

const modelList = ref<any[]>([]);
async function getModelList() {
	const response = await ollama.list();
	// console.log(response);
	modelList.value = response.models;
}
getModelList();

const processList = ref<any[]>([]);
async function getProcessList() {
	const response = await ollama.ps();
	// console.log(response);
	processList.value = [...response.models];
}
getProcessList();

const modelfileContent = ref('');
const originalModelfileContent = ref('');
async function showModelFile(request: { model: string }) {
	const showRequest: any = { model: request.model };
	const response = await ollama.show(showRequest);
	const lines = response.modelfile.split('\n');
	const filteredLines = [];

	for (const line of lines) {
		if (line.trim() === '' || line.trim().startsWith('#')) {
			continue;
		}
		filteredLines.push(line);
	}
	modelfileContent.value = filteredLines.join('\n');
	originalModelfileContent.value = modelfileContent.value; // store original content
}

const isLoading = ref(false);
async function saveModelFile(request: { model: string; modelfile: string }) {
	const promise = () =>
		new Promise(async (resolve, reject) => {
			try {
				isLoading.value = true;
				const createNewRequest: any = {
					model: request.model,
					modelfile: request.modelfile,
				};
				await ollama.create(createNewRequest);
				resolve({ name: request.model });
			} catch (error: any) {
				reject(error);
			}
		});

	toast.promise(promise, {
		loading: 'Saving modelfile...',
		success: (data) => {
			isLoading.value = false;
			return `Modelfile ${data.name} saved successfully`;
		},
		error: (error: any) => {
			console.error(`Error creating new model: ${error}`);
			console.error(error.stack);
			isLoading.value = false;
			return `Failed to create ${request.model} with modelfile: ${error.message}`;
		},
	});
}

function undoChanges() {
	modelfileContent.value = originalModelfileContent.value; // revert to original content
}

async function renameModel(request: { source: string; destination: string }) {
	try {
		const copyRequest: any = { source: request.source, destination: request.destination.trim() };
		const deleteRequest: any = { model: request.source };
		// console.log(copyRequest);
		await ollama.copy(copyRequest);
		await ollama.delete(deleteRequest);
		getModelList();
		toast.success(`${request.source} renamed successfully`, {
			description: `Renamed model to ${copyRequest.destination}`,
		});
	} catch (error: any) {
		console.error(`Error renaming model: ${error}`);
		toast.error(`Failed to rename ${request.source}`, {
			description: `Error: ${error.message}`,
		});
	}
}

async function copyModel(request: { source: string; destination: string }) {
	try {
		const copyRequest: any = { source: request.source, destination: request.destination.trim() };
		// console.log(copyRequest);
		await ollama.copy(copyRequest);
		getModelList();
		toast.success(`Model copied successfully`, {
			description: `Copied model to ${copyRequest.destination}`,
		});
	} catch (error: any) {
		console.error(`Error copying model: ${error}`);
		toast.error(`Failed to copy ${request.source}`, {
			description: `Error: ${error.message}`,
		});
	}
}

async function deleteModel(request: { model: string }) {
	try {
		const deleteRequest: any = { model: request.model };
		// console.log(deleteRequest);
		await ollama.delete(deleteRequest);
		getModelList();
		toast.success(`Model deleted successfully`, {
			description: `Deleted model ${request.model}`,
		});
	} catch (error: any) {
		console.error(`Error deleting model: ${error}`);
		toast.error(`Failed to delete ${request.model}`, {
			description: `Error: ${error.message}`,
		});
	}
}

let intervalId = null;
intervalId = setInterval(getProcessList, 1000);

onBeforeUnmount(() => {
	clearInterval(intervalId);
});

const filterModel = ref('');
const sortBy = ref('name');
const sortOrder = ref('asc');
const sortedModelList = computed(() => {
	if (!filterModel.value) {
		if (sortBy.value === 'name') {
			return modelList.value.slice().sort((a, b) => {
				if (sortOrder.value === 'asc') {
					return a.name.localeCompare(b.name);
				} else {
					return b.name.localeCompare(a.name);
				}
			});
		} else if (sortBy.value === 'size') {
			return modelList.value.slice().sort((a, b) => {
				if (sortOrder.value === 'asc') {
					return b.size - a.size;
				} else {
					return a.size - b.size;
				}
			});
		} else if (sortBy.value === 'modified_at') {
			return modelList.value.slice().sort((a, b) => {
				if (sortOrder.value === 'asc') {
					return new Date(a.modified_at).getTime() - new Date(b.modified_at).getTime();
				} else {
					return new Date(b.modified_at).getTime() - new Date(a.modified_at).getTime();
				}
			});
		}
		return modelList.value;
	}
	return modelList.value
		.filter((model) => model.name.toLowerCase().includes(filterModel.value.toLowerCase()))
		.slice()
		.sort((a, b) => {
			if (sortOrder.value === 'asc') {
				return a[sortBy.value] < b[sortBy.value] ? -1 : 1;
			} else {
				return a[sortBy.value] < b[sortBy.value] ? 1 : -1;
			}
		});
});

const formatSize = (bytes: number) => {
	if (bytes === 0) return '0 Bytes';
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB'];
	const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), 3);
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDateTime = (datetime: string) => {
	const date = new Date(datetime);
	const now = new Date();
	const diffTime = now.getTime() - date.getTime();
	const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	const dateString = date.toISOString().slice(0, 10); // YYYY-MM-DD

	if (diffDays === 0) {
		return `${dateString} (today)`;
	} else if (diffDays === 1) {
		return `${dateString} (yesterday)`;
	} else {
		return `${dateString} (${diffDays} days ago)`;
	}
};

const timeLeft = (expiresAt: string) => {
	const expiresAtDate = new Date(expiresAt);
	const now = new Date();
	const timeLeft: number = expiresAtDate.getTime() - now.getTime();

	const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
	const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

	const timeLeftArray = [];

	if (days > 0) {
		timeLeftArray.push(`${days} days`);
	}
	if (hours > 0) {
		timeLeftArray.push(`${hours} hours`);
	}
	if (minutes > 0) {
		timeLeftArray.push(`${minutes} minutes`);
	}
	if (seconds > 0) {
		timeLeftArray.push(`${seconds} seconds`);
	}

	return timeLeftArray.join(', ');
};
</script>

<template>
	<div class="h-screen px-2 overflow-y-hidden bg-background">
		<div class="flex max-w-lg gap-1 pt-2 mx-auto md:max-w-xl">
			<div class="w-full">
				<Input
					name="filterModel"
					class="focus-visible:outline-none"
					v-model="filterModel"
					:placeholder="`Search ${modelList.length} models...`" />
			</div>

			<Popover>
				<PopoverTrigger>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<Button variant="default">
									<Icon
										icon="radix-icons:gear"
										class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
									<Icon
										icon="radix-icons:gear"
										class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								<p>Settings</p>
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</PopoverTrigger>
				<PopoverContent class="flex flex-col gap-4">
					<Separator label="SORT BY" />
					<ToggleGroup
						class="flex justify-between gap-1"
						type="single">
						<ToggleGroupItem
							value="name"
							@click="
								sortBy = 'name';
								sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
							">
							NAME
						</ToggleGroupItem>
						<ToggleGroupItem
							value="size"
							@click="
								sortBy = 'size';
								sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
							">
							SIZE
						</ToggleGroupItem>
						<ToggleGroupItem
							value="mod"
							@click="
								sortBy = 'modified_at';
								sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
							">
							LATEST
						</ToggleGroupItem>
					</ToggleGroup>

					<Separator label="THEMES" />
					<ToggleGroup
						class="flex justify-between gap-1"
						type="single">
						<ToggleGroupItem
							value="light"
							@click="mode = 'light'">
							LIGHT
						</ToggleGroupItem>
						<ToggleGroupItem
							value="dark"
							@click="mode = 'dark'">
							DARK
						</ToggleGroupItem>
						<ToggleGroupItem
							value="auto"
							@click="mode = 'auto'">
							SYSTEM
						</ToggleGroupItem>
					</ToggleGroup>

					<Separator label="BASE URL" />
					<div class="flex justify-between gap-1">
						<Input
							name="base-url"
							class="focus-visible:outline-none"
							placeholder="Enter Base URL" />
						<Button>
							<Icon
								icon="radix-icons:check"
								class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
							<Icon
								icon="radix-icons:check"
								class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
						</Button>
					</div>

					<Separator label="DEBUG" />
					<div class="flex justify-center">
						<Button
							variant="destructive"
							@click="
								() => {
									console.log('event triggered!');
									toast('Event has been triggered!', {});
								}
							">
							TRIGGER TOAST
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>

		<div class="flex flex-col h-screen gap-2 py-2 pb-20">
			<ScrollArea
				class="flex-none w-full max-w-lg mx-auto border rounded md:max-w-xl bg-background"
				v-if="processList && processList.length > 0">
				<Accordion
					class="w-full h-full px-2"
					type="single"
					collapsible>
					<AccordionItem value="processes">
						<AccordionTrigger
							>{{ processList.length }}
							{{ processList.length === 1 ? 'model' : 'models' }}
							loaded</AccordionTrigger
						>

						<AccordionContent class="mb-1">
							<div
								v-for="(model, index) in processList"
								:key="index">
								<Card>
									<CardHeader>
										<CardTitle class="text-lg">
											{{ model.model }}
										</CardTitle>
										<CardDescription>
											<p>Size VRAM: {{ formatSize(model.size_vram) }}</p>
											<p>Size: {{ formatSize(model.size) }}</p>
											<p>Expires at: {{ timeLeft(model.expires_at) }}</p>
										</CardDescription>
									</CardHeader>
									<!-- <CardContent> Card Content </CardContent> -->
									<!-- <CardFooter> Card Footer </CardFooter> -->
								</Card>
							</div>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</ScrollArea>

			<ScrollArea class="flex-auto w-full max-w-lg mx-auto border rounded md:max-w-xl bg-background">
				<Accordion
					class="w-full h-full pl-2 pr-4"
					type="single"
					collapsible>
					<!-- models list -->
					<AccordionItem
						v-for="(model, index) in sortedModelList"
						:key="index"
						:value="`item-${index}`">
						<AccordionTrigger @click="showModelFile({ model: model.name })"> {{ model.name }} </AccordionTrigger>

						<AccordionContent>
							<Tabs
								default-value="modelinfo_tab"
								class="w-full">
								<TabsList class="flex">
									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<TabsTrigger value="modelinfo_tab"> Modelinfo </TabsTrigger>
											</TooltipTrigger>
											<TooltipContent>
												<p>Modelinfo</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<TooltipProvider>
										<Tooltip>
											<TooltipTrigger>
												<TabsTrigger
													name="modelfile_tab"
													value="modelfile_tab">
													Modelfile
												</TabsTrigger>
											</TooltipTrigger>
											<TooltipContent>
												<p>Modelfile</p>
											</TooltipContent>
										</Tooltip>
									</TooltipProvider>

									<div class="flex-grow"></div>

									<Dialog>
										<DialogTrigger>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<Button variant="ghost"> RN </Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Rename</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Rename Model</DialogTitle>
												<DialogDescription> Enter a new name for {{ model.name }} </DialogDescription>
											</DialogHeader>
											<Input
												name="rename-model"
												class="focus-visible:outline-none"
												v-model="newName"
												:placeholder="`Enter model name...`" />
											<DialogFooter>
												<DialogClose as-child>
													<Button
														variant="default"
														@click="
															() => {
																renameModel({ source: model.name, destination: newName });
															}
														">
														Rename
													</Button>
												</DialogClose>
											</DialogFooter>
										</DialogContent>
									</Dialog>

									<Dialog>
										<DialogTrigger>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<Button variant="ghost"> CP </Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Copy</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Copy Model</DialogTitle>
												<DialogDescription> Enter a new name for {{ model.name }} </DialogDescription>
											</DialogHeader>
											<Input
												name="copy-model"
												class="focus-visible:outline-none"
												v-model="newName"
												:placeholder="`Enter model name...`" />
											<DialogFooter>
												<DialogClose as-child>
													<Button
														variant="default"
														@click="
															() => {
																copyModel({ source: model.name, destination: newName });
															}
														">
														Copy
													</Button>
												</DialogClose>
											</DialogFooter>
										</DialogContent>
									</Dialog>

									<Dialog>
										<DialogTrigger>
											<TooltipProvider>
												<Tooltip>
													<TooltipTrigger>
														<Button variant="ghost"> RM </Button>
													</TooltipTrigger>
													<TooltipContent>
														<p>Remove</p>
													</TooltipContent>
												</Tooltip>
											</TooltipProvider>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Remove Model</DialogTitle>
												<DialogDescription> Are you sure you want to remove {{ model.name }}? </DialogDescription>
											</DialogHeader>
											<DialogFooter>
												<DialogClose as-child>
													<Button
														variant="destructive"
														@click="
															() => {
																deleteModel({ model: model.name });
															}
														">
														Remove
													</Button>
												</DialogClose>
											</DialogFooter>
										</DialogContent>
									</Dialog>
								</TabsList>

								<TabsContent value="modelinfo_tab">
									<ul class="flex flex-wrap gap-2">
										<li class="px-2 py-1 border rounded w-fit">Model Name: {{ model.name }}</li>
										<li class="px-2 py-1 border rounded w-fit">Model Size: {{ formatSize(model.size) }}</li>
										<li class="px-2 py-1 border rounded w-fit">Modified At: {{ formatDateTime(model.modified_at) }}</li>
										<li
											class="px-2 py-1 border rounded w-fit"
											v-for="(value, key) in model.details"
											:key="key">
											{{
												`${key}`
													.replace('_', ' ')
													.split(' ')
													.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
													.join(' ')
											}}: {{ value }}
										</li>
									</ul>
								</TabsContent>

								<TabsContent
									class="flex flex-col gap-2"
									value="modelfile_tab">
									<Textarea
										name="model-file-area"
										class="focus-visible:outline-none min-h-52"
										placeholder="Modelfile loads here..."
										v-model="modelfileContent" />
									<div class="flex justify-end gap-1">
										<Button
											@click="undoChanges"
											variant="secondary"
											>Undo</Button
										>
										<Button
											class="flex justify-center"
											:disabled="isLoading"
											variant="destructive"
											@click="
												() => {
													saveModelFile({ model: model.name, modelfile: modelfileContent });
												}
											">
											<Loader2
												v-if="isLoading"
												class="w-4 h-4 animate-spin" />
											<span v-if="!isLoading">Save</span>
										</Button>
									</div>
								</TabsContent>
							</Tabs>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</ScrollArea>

			<div class="fixed flex justify-center w-full bottom-2">
				<p class="text-xs">
					made with ❤️ by
					<a
						class="underline"
						href="https://github.com/endo9000"
						target="_blank">
						endoLlama
					</a>
				</p>
			</div>
		</div>
	</div>
	<Toaster
		position="top-center"
		richColors />
</template>

<style scoped></style>