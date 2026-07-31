"use client";

import { Home, Palette, Plus, ShoppingCart, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Chip,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  EmptyState,
  FloatingActionButton,
  Icon,
  Input,
  Label,
  Loading,
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
  Progress,
  Search,
  Section,
  Skeleton,
  Stepper,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@/features/shared";

export function DesignSystemShowcase() {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [chipOn, setChipOn] = useState(true);
  const [checked, setChecked] = useState(true);
  const [switched, setSwitched] = useState(true);

  return (
    <div className="space-y-12 pb-24">
      <header className="space-y-3">
        <Badge variant="accent">Linguagem Ninho</Badge>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Design System</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Paleta de ninho: sage acolhedor, coral quente e tipografia Nunito — feita para a família,
          não para um dashboard frio.
        </p>
      </header>

      <Section title="Cores" description="Superfícies, marca e feedback — light e dark.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            ["primary", "bg-primary"],
            ["accent", "bg-accent"],
            ["secondary", "bg-secondary"],
            ["muted", "bg-muted"],
            ["card", "bg-card border border-border"],
            ["destructive", "bg-destructive"],
          ].map(([name, cls]) => (
            <div key={name} className="space-y-2">
              <div className={`h-16 rounded-xl shadow-xs ${cls}`} />
              <p className="text-xs font-medium capitalize tracking-tight">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Tipografia"
        description="Nunito — tipografia amigável, arredondada e legível no dia a dia da família."
      >
        <Card>
          <CardContent className="space-y-3 pt-5">
            <p className="text-4xl font-semibold tracking-tight">Display 4xl</p>
            <p className="text-2xl font-semibold tracking-tight">Title 2xl</p>
            <p className="text-lg font-medium tracking-tight">Headline lg</p>
            <p className="text-sm text-muted-foreground">
              Body sm — a rotina da casa merece tipografia clara, sem ruído.
            </p>
          </CardContent>
        </Card>
      </Section>

      <Section title="Button" description="Ações com micro-scale e variantes suaves.">
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="destructive">Destructive</Button>
          <Button size="icon" aria-label="Add">
            <Icon icon={Plus} />
          </Button>
        </div>
      </Section>

      <Section title="Search · Input · Controls">
        <div className="grid gap-4 md:grid-cols-2">
          <Search
            placeholder="Buscar na casa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch("")}
          />
          <div className="space-y-2">
            <Label htmlFor="demo-input">Campo</Label>
            <Input id="demo-input" placeholder="Ex.: leite, fraldas…" />
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
              id="demo-check"
            />
            <Label htmlFor="demo-check">Concluído</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={switched} onCheckedChange={setSwitched} id="demo-switch" />
            <Label htmlFor="demo-switch">Lembretes</Label>
          </div>
        </div>
      </Section>

      <Section title="Badge · Chip · Avatar">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>Default</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="outline">Outline</Badge>
          <Chip
            selected={chipOn}
            onClick={() => setChipOn((v) => !v)}
            onRemove={() => setChipOn(false)}
          >
            Compras
          </Chip>
          <Chip>Estoque</Chip>
          <Avatar>
            <AvatarFallback>MN</AvatarFallback>
          </Avatar>
        </div>
      </Section>

      <Section title="Card · Tabs · Progress · Stepper">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Visão geral</TabsTrigger>
            <TabsTrigger value="progress">Progresso</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Rotina da semana</CardTitle>
                <CardDescription>Um cartão calmo, sem chrome excessivo.</CardDescription>
              </CardHeader>
              <CardContent>
                <Stepper
                  currentStep={1}
                  steps={[
                    { id: "1", label: "Planejar" },
                    { id: "2", label: "Comprar" },
                    { id: "3", label: "Organizar" },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="progress" className="space-y-3">
            <Progress value={64} />
            <Skeleton className="h-20 w-full" />
            <Loading />
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Modal · Drawer · Toast">
        <div className="flex flex-wrap gap-2">
          <Modal>
            <ModalTrigger asChild>
              <Button variant="outline">Abrir modal</Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Novo item</ModalTitle>
                <ModalDescription>Exemplo de diálogo premium e acessível.</ModalDescription>
              </ModalHeader>
              <ModalFooter>
                <Button variant="secondary">Cancelar</Button>
                <Button>Salvar</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">Abrir drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Ações rápidas</DrawerTitle>
                <DrawerDescription>Sheet inferior no estilo mobile premium.</DrawerDescription>
              </DrawerHeader>
              <Button className="w-full">Continuar</Button>
            </DrawerContent>
          </Drawer>

          <Button
            variant="soft"
            onClick={() =>
              toast.success("Tudo certo", { description: "Sincronizado com a família." })
            }
          >
            Disparar toast
          </Button>
        </div>
      </Section>

      <Section title="Calendar">
        <Calendar value={selectedDate} onChange={setSelectedDate} />
      </Section>

      <Section title="Empty State">
        <EmptyState
          icon={<Icon icon={Sparkles} size="md" />}
          title="Nada por aqui"
          description="Estados vazios devem convidar à ação — nunca parecer erro."
          action={
            <Button>
              <Icon icon={Plus} />
              Criar primeiro item
            </Button>
          }
        />
      </Section>

      <Section
        title="Layout primitives"
        description="Header, Sidebar, Bottom Nav e FAB já no AppShell."
      >
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">
            <Icon icon={Home} size="xs" /> Header
          </Badge>
          <Badge variant="secondary">Sidebar</Badge>
          <Badge variant="secondary">Bottom Navigation</Badge>
          <Badge variant="secondary">
            <Icon icon={ShoppingCart} size="xs" /> FAB
          </Badge>
          <Badge variant="secondary">
            <Icon icon={Palette} size="xs" /> Section
          </Badge>
        </div>
      </Section>

      <FloatingActionButton
        label="Ação flutuante"
        onClick={() => toast("FAB", { description: "Ação rápida no padrão Things/Linear." })}
      />
    </div>
  );
}
