<script setup lang="ts">
import { ref, computed } from "vue";

import { useColorMode } from "@vueuse/core";
import { Icon } from "@iconify/vue";
import { toast } from "vue-sonner";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const mode = useColorMode();

import { Ollama } from "ollama";
const ollama = new Ollama({ host: "http://127.0.0.1:11434" });

const modelList = ref([]);
async function getModelList() {
  const response = await ollama.list();
  console.log(response);
  modelList.value = response.models;
}

getModelList();

const searchTerm = ref("");
const filteredModelList = computed(() => {
  if (!searchTerm.value) return modelList.value;
  return modelList.value.filter((model) =>
    model.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

const sortBy = ref("name");
const sortedModelList = computed(() => {
  if (!searchTerm.value) {
    if (sortBy.value === "name") {
      return modelList.value
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy.value === "size") {
      return modelList.value.slice().sort((a, b) => a.size - b.size);
    } else if (sortBy.value === "modified_at") {
      return modelList.value
        .slice()
        .sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at));
    }
    return modelList.value;
  }
  return modelList.value
    .filter((model) =>
      model.name.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
    .slice()
    .sort((a, b) => (a[sortBy.value] < b[sortBy.value] ? -1 : 1));
});

async function deleteModel(request: { modelName: string }) {
  console.log(request.modelName);
  await ollama.delete(request.modelName);
  getModelList();
}

async function copyModel(modelName: string) {
  await ollama.copy(modelName);
  getModelList();
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), 3);
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const formatDateTime = (datetime) => {
  const date = new Date(datetime);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const dateString = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return `${dateString} (${diffDays} days ago)`;
};
</script>

<template>
  <div class="h-screen overflow-y-hidden bg-background">
    <Toaster richColors position="top-center" />

    <div class="flex justify-center max-w-md gap-1 pt-2 mx-auto md:max-w-xl">
      <div class="w-full">
        <Input
          class="focus-visible:outline-none"
          v-model="searchTerm"
          :placeholder="`Search ${modelList.length} models...`"
        />
      </div>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Popover>
              <PopoverTrigger>
                <Button variant="">
                  <Icon
                    icon="radix-icons:gear"
                    class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                  />
                  <Icon
                    icon="radix-icons:gear"
                    class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Separator class="mb-4" label="SORT BY" />
                <ToggleGroup class="flex justify-between gap-1" type="single">
                  <ToggleGroupItem value="name" @click="sortBy = 'name'">
                    NAME
                  </ToggleGroupItem>
                  <ToggleGroupItem value="size" @click="sortBy = 'size'">
                    SIZE
                  </ToggleGroupItem>
                  <ToggleGroupItem value="mod" @click="sortBy = 'modified_at'">
                    LATEST
                  </ToggleGroupItem>
                </ToggleGroup>

                <Separator class="my-4" label="THEMES" />
                <ToggleGroup class="flex justify-between gap-1" type="single">
                  <ToggleGroupItem value="light" @click="mode = 'light'">
                    LIGHT
                  </ToggleGroupItem>
                  <ToggleGroupItem value="dark" @click="mode = 'dark'">
                    DARK
                  </ToggleGroupItem>
                  <ToggleGroupItem value="auto" @click="mode = 'auto'">
                    SYSTEM
                  </ToggleGroupItem>
                </ToggleGroup>

                <Separator class="my-4" label="BASE URL" />
                <div class="flex justify-between gap-1">
                  <Input
                    class="focus-visible:outline-none"
                    placeholder="Enter Base URL"
                  />
                  <Button>
                    <Icon
                      icon="radix-icons:check"
                      class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                    />
                    <Icon
                      icon="radix-icons:check"
                      class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                    />
                  </Button>
                </div>

                <Separator class="my-4" label="DEBUG" />
                <div class="flex justify-center">
                  <Button
                    variant="destructive"
                    @click="
                      () => {
                        console.log('event triggered!');
                        toast('Event has been triggered!', {});
                      }
                    "
                  >
                    TRIGGER TOAST
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>

    <div class="h-full py-2 pb-20">
      <Accordion
        class="h-full max-w-md mx-auto md:max-w-xl"
        type="single"
        collapsible
      >
        <ScrollArea
          class="w-full h-full pl-2 pr-4 border rounded-md bg-background"
        >
          <AccordionItem
            v-for="(model, index) in sortedModelList"
            :key="index"
            :value="`item-${index}`"
          >
            <AccordionTrigger> {{ model.name }} </AccordionTrigger>

            <AccordionContent>
              <Tabs default-value="modelinfo_tab" class="max-w-md md:max-w-xl">
                <TabsList class="flex">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <TabsTrigger value="modelinfo_tab">
                          Modelinfo
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Modelinfo</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <TabsTrigger value="modelfile_tab">
                          Modelfile
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Modelfile</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <div class="flex-grow"></div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          @click="() => console.log('rename', model.name)"
                        >
                          RN
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rename</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          @click="() => console.log('copy', model.name)"
                        >
                          CP
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          @click="() => console.log('remove', model.name)"
                        >
                          RM
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TabsList>

                <TabsContent value="modelinfo_tab">
                  <ul class="flex flex-wrap">
                    <li class="px-2 py-1 m-1 border rounded w-fit">
                      Model Name: {{ model.name }}
                    </li>
                    <li class="px-2 py-1 m-1 border rounded w-fit">
                      Model Size: {{ formatSize(model.size) }}
                    </li>
                    <li class="px-2 py-1 m-1 border rounded w-fit">
                      Modified At: {{ formatDateTime(model.modified_at) }}
                    </li>

                    <li
                      class="px-2 py-1 m-1 border rounded w-fit"
                      v-for="(value, key) in model.details"
                      :key="key"
                    >
                      {{
                        key
                          .replace("_", " ")
                          .split(" ")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")
                      }}:

                      {{ value }}
                    </li>
                  </ul>
                </TabsContent>

                <TabsContent value="modelfile_tab">
                  <Textarea
                    class="focus-visible:outline-none min-h-48"
                    placeholder="Modelfile loads here..."
                  />
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        </ScrollArea>
      </Accordion>
      <div class="flex justify-center pt-1.5 text-sm">
        made with love by endoLlama
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
