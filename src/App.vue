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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import ollama from "ollama";

const mode = useColorMode();
const position = ref("top");
const searchTerm = ref("");
const modelList = ref([]);
const filteredModelList = computed(() => {
  if (!searchTerm.value) return modelList.value;
  return modelList.value.filter((model) =>
    model.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

async function getModelList() {
  const response = await ollama.list();
  console.log(response);
  modelList.value = response.models;
  return modelList;
}

getModelList();

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
</script>

<template>
  <div class="h-screen overflow-y-hidden bg-background">
    <div class="flex justify-center max-w-md pt-2 mx-auto md:max-w-xl">
      <div class="w-full pr-1">
        <Input class="focus-visible:outline-none" v-model="searchTerm" placeholder="Search # models..." />
      </div>

      <TooltipProvider>
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
            <p>select theme</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>

    <div class="h-full py-2 pb-14">
      <Accordion
        class="h-full max-w-md mx-auto md:max-w-xl"
        type="single"
        collapsible
      >
        <ScrollArea class="w-full h-full pl-2 pr-4 border rounded-md bg-background">
          <AccordionItem
            v-for="(model, index) in filteredModelList"
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
                        <Button variant="ghost">Rename</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rename</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="ghost">Copy</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button variant="ghost">Delete</Button>
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
                    class="focus-visible:outline-none min-h-32"
                    placeholder="Type your message here."
                  />
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </AccordionItem>
        </ScrollArea>
      </Accordion>
    </div>
  </div>
</template>

<style scoped></style>

<!-- <Toaster v-if="$screens.lg" position="bottom-right" />
    <Toaster position="top-center" />
    <div class="flex justify-center pb-2">
      <Button
        variant="destructive"
        @click="
          () => {
            toast('Event has been triggered!', {});
          }
        "
      >
        Trigger Toast
      </Button>
    </div> -->

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
