<script setup lang="ts">
import { ref } from "vue";

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

const mode = useColorMode();

const position = ref("top");
</script>

<template>
  <div class="py-2">
    <Button class="flex py-2 mx-auto" variant="">Button</Button>
  </div>

  <div class="flex justify-center">
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
  </div>

  <div class="flex justify-center py-2">
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
          <span class="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem @click="mode = 'light'"> Light </DropdownMenuItem>
        <DropdownMenuItem @click="mode = 'dark'"> Dark </DropdownMenuItem>
        <DropdownMenuItem @click="mode = 'auto'"> System </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <!-- <Toaster v-if="$screens.lg" position="bottom-right" /> -->
  <Toaster position="bottom-center" />
  <div class="flex justify-center py-2">
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
  </div>

  <div class="flex justify-center py-2">
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>tooltip (hover)</TooltipTrigger>
        <TooltipContent>
          <p>TOOLTIP</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>

  <div class="max-w-md py-2 mx-auto">
    <Input placeholder="Type your message here." />
    <div class="max-w-md py-5 mx-auto">
      <Separator label="Or" />
    </div>
    <Textarea placeholder="Type your message here." />
  </div>

  <div class="py-2">
    <Accordion class="max-w-md mx-auto" type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>accordion 1</AccordionTrigger>
        <AccordionContent>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Dolores
          perspiciatis exercitationem quidem sit illo numquam porro. Libero
          nesciunt similique rem esse officiis alias, ut totam quam nulla odit
          quas voluptates!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>accordion 2</AccordionTrigger>
        <AccordionContent>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus,
          reprehenderit dignissimos. Adipisci, porro eaque facere dicta unde
          exercitationem earum quos laudantium tempora, sequi est tenetur beatae
          praesentium nisi. Vero, reprehenderit.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>

  <div class="max-w-md py-5 mx-auto">
    <Separator label="And" />
  </div>

  <div class="flex justify-center py-2">
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
              <p>btn 1 tooltip</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost">btn 2</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>btn 2 tooltip</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button variant="ghost">btn 3</Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>btn 3 tooltip</p>
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
  </div>
</template>

<style scoped></style>
