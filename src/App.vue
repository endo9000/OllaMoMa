<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';

import { useColorMode } from '@vueuse/core';
import { Icon } from '@iconify/vue';
import { toast } from 'vue-sonner';

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

import { Ollama } from 'ollama';

const base_url = 'http://127.0.0.1:11434';

const newName = '';

const mode = useColorMode();
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

//@ts-ignore
async function deleteModel(request: { modelName: string }) {
	const deleteRequest: any = { modelName: request.modelName };
	console.log(request.modelName);
	await ollama.delete(deleteRequest);
	getModelList();
}

// @ts-ignore
async function copyModel(request: { modelName: string }) {
	const copyRequest: any = { modelName: request.modelName };
	console.log(request.modelName);
	await ollama.copy(copyRequest);
	getModelList();
}

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
		<Toaster
			richColors
			position="top-center" />
		<div class="flex justify-center flex-auto max-w-lg gap-1 pt-2 mx-auto md:max-w-xl">
			<div class="w-full">
				<Input
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
					type="multiple"
					collapsible>
					<!-- models list -->
					<AccordionItem
						v-for="(model, index) in sortedModelList"
						:key="index"
						:value="`item-${index}`">
						<AccordionTrigger> {{ model.name }} </AccordionTrigger>

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
												<TabsTrigger value="modelfile_tab"> Modelfile </TabsTrigger>
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
												class="focus-visible:outline-none"
												v-model="newName"
												:placeholder="`Enter model name...`" />
											<DialogFooter>
												<DialogClose as-child>
													<Button
														variant="default"
														@click="
															() => {
																console.log('rename', model.name, 'to', newName);
																toast(`Model renamed to ${newName} successfully!`, {});
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
												class="focus-visible:outline-none"
												v-model="newName"
												:placeholder="`Enter model name...`" />
											<DialogFooter>
												<DialogClose as-child>
													<Button
														variant="default"
														@click="
															() => {
																console.log('copy', model.name, 'to', newName);
																toast(`Model copied to ${newName} successfully!`, {});
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
												<DialogDescription>
													Are you sure you want to remove
													{{ model.name }}?
												</DialogDescription>
											</DialogHeader>

											<DialogFooter>
												<DialogClose as-child>
													<Button
														variant="destructive"
														@click="
															() => {
																console.log('delete', model.name);
																toast('Model deleted successfully!', {});
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

								<TabsContent value="modelfile_tab">
									<Textarea
										class="focus-visible:outline-none min-h-48"
										placeholder="Modelfile loads here..." />
								</TabsContent>
							</Tabs>
						</AccordionContent>
					</AccordionItem>
				</Accordion>
			</ScrollArea>

			<div class="fixed flex justify-center w-full bottom-2">
				<p class="text-xs">
					made with love by
					<a
						class="underline"
						href="https://github.com/endo9000"
						target="_blank"
						>endoLlama</a
					>
				</p>
			</div>
		</div>
	</div>
</template>

<style scoped></style>

<!-- <TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="">
            <Icon
              icon="radix-icons:sun"
              class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <Icon
              icon="radix-icons:moon"
              class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem @click="mode = 'light'"
            >Light</DropdownMenuItem
          >
          <DropdownMenuItem @click="mode = 'dark'">Dark</DropdownMenuItem>
          <DropdownMenuItem @click="mode = 'auto'"
            >System</DropdownMenuItem
          >
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipTrigger>
    <TooltipContent>
      <p>Themes</p>
    </TooltipContent>
  </Tooltip>
</TooltipProvider> -->

<!-- <div class="py-2">
    <Button class="flex py-2 mx-auto" variant="">Button</Button>
  </div> -->

<!-- <div class="flex justify-center">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button class="my-2" variant="">Dropdown</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="w-56">
        <DropdownMenuLabel>Panel Position</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup v-model="position">
          <DropdownMenuRadioItem value="top"> Top </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="bottom"> Bottom </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="right"> Right </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  </div> -->

<!-- <div class="flex justify-center py-2">
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger>tooltip (hover)</TooltipTrigger>
      <TooltipContent>
        <p</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</div> -->

<!-- <div class="max-w-md py-2 mx-auto">
    <Input placeholder="Type your message here." />
    <div class="max-w-md py-5 mx-auto">
      <Separator label="Or" />
    </div>
    <Textarea placeholder="Type your message here." />
  </div> -->

<!-- <div class="max-w-md py-5 mx-auto">
    <Separator label="And" />
  </div> -->

<!-- <div class="flex justify-center py-2">
    <Tabs default-value="tab_1" class="max-w-md">
      <TabsList class="flex">
        <TabsTrigger value="tab_1"> tab 1 </TabsTrigger>
        <TabsTrigger value="tab_2"> tab 2 </TabsTrigger>

        <div class="flex-grow"></div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost">btn 1</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>btn 1</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost">btn 2</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>btn 2</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost">btn 3</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>btn 3</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TabsList>

      <TabsContent value="tab_1">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem repellat
        nihil ullam magni dignissimos error doloribus, rem laudantium
        perferendis! Odit dolorem, consequatur necessitatibus iure tempore
        voluptatibus quasi ipsam dolores culpa!
      </TabsContent>
      <TabsContent value="tab_2">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Aut, fuga?
        Quisquam repellendus ut quasi ipsa, sed impedit nulla enim modi et velit
        facere accusamus vel natus iure quis ipsum laudantium!
      </TabsContent>
    </Tabs>
  </div> -->
