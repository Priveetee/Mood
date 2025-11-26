"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { ArrowLeft, Copy, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { trpc } from "@/lib/trpc/client"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
}

export default function CampaignLinksPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = Number(params.id)

  const campaignQuery = trpc.campaign.list.useQuery()
  const linksQuery = trpc.campaign.getLinks.useQuery(campaignId, {
    enabled: !Number.isNaN(campaignId),
  })

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success(message)
      })
      .catch(() => {
        toast.error("Impossible de copier dans le presse-papiers.")
      })
  }

  if (Number.isNaN(campaignId)) {
    router.replace("/admin/campaigns/active")
    return null
  }

  if (linksQuery.isLoading || campaignQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-transparent" />
      </div>
    )
  }

  if (linksQuery.isError) {
    toast.error(linksQuery.error.message)
    router.replace("/admin/campaigns/active")
    return null
  }

  const campaignName =
    campaignQuery.data?.find((c) => c.id === campaignId)?.name ||
    "Campagne"

  const generatedLinks =
    linksQuery.data?.map((link) => ({
      managerName: link.managerName,
      url: link.url,
    })) || []

  const handleCopyAll = () => {
    const allLinks = generatedLinks
      .map((link) => `${link.managerName}: ${link.url}`)
      .join("\n")
    copyToClipboard(allLinks, "Tous les liens ont été copiés !")
  }

  const handleSendEmail = () => {
    const allLinks = generatedLinks
      .map((link) => `${link.managerName}: ${link.url}`)
      .join("\n")
    const subject = `Liens pour la campagne de sondage: ${campaignName}`
    const body = `Bonjour,\n\nVoici les liens de sondage pour vos équipes respectives :\n\n${allLinks}\n\nCordialement.`
    window.location.href = `mailto:?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`
    toast.info("Ouverture de votre client de messagerie...")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-slate-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Dashboard
          </Link>
          <Link
            href="/admin/campaigns/new"
            className="text-slate-400 transition-colors hover:text-white"
          >
            Créer une autre campagne
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-lg">
            <CardHeader className="flex flex-row items-start justify-between p-8">
              <div>
                <CardTitle className="text-4xl font-bold text-white">
                  {campaignName} - Liens
                </CardTitle>
                <p className="mt-1 text-slate-400">
                  {generatedLinks.length} liens ont été créés.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                  onClick={handleCopyAll}
                >
                  <Copy className="h-4 w-4" /> Copier tout
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                  onClick={handleSendEmail}
                >
                  <Send className="h-4 w-4" /> Envoyer par email
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <ScrollArea className="h-[400px] w-full">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3 pr-6"
                >
                  {generatedLinks.map((link, index) => (
                    <motion.div variants={itemVariants} key={index}>
                      <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                        <span className="text-sm font-mono text-slate-300">
                          {link.managerName}: {link.url}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400"
                          onClick={() =>
                            copyToClipboard(
                              `${link.managerName}: ${link.url}`,
                              "Lien du manager copié !",
                            )
                          }
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
